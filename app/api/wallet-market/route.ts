// Server-side market feed for the Solana wallet demo.
//
// The client never talks to a priced upstream directly: this route holds the
// Alchemy key server-side (same pattern as /api/canton) and collapses all
// visitor traffic onto one cached upstream read per minute. Prices are display
// grade — the demo never routes a transaction.
//
//  - solUsd / paxgUsd / jitoUsd: Alchemy's Prices API per SPL mint, falling
//    back to Jupiter's price endpoint (and a real 1-unit Jupiter quote for any
//    mint neither covers) so a price is never silently dropped.
//  - jitoApy: the jitoSOL APY (staking + MEV) from Jito's own Kobe stats feed.
//    Never fabricated; null when the feed is unreachable.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WSOL_MINT = "So11111111111111111111111111111111111111112"
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
const PAXG_MINT = "5GgRAEmv8ZxF2PR5hY72Qs5x1bnQ6UK2RbTPoqJ3wSwW"
const JITOSOL_MINT = "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"
const USDC_DECIMALS = 6
const PAXG_DECIMALS = 6
const JITOSOL_DECIMALS = 9

const JUP_PRICE = "https://lite-api.jup.ag/price/v3"
const JUP_QUOTE = "https://lite-api.jup.ag/swap/v1/quote"
const KOBE = "https://kobe.mainnet.jito.network/api/v1/stake_pool_stats"

type Payload = {
  solUsd: number | null
  paxgUsd: number | null
  jitoUsd: number | null
  jitoApy: number | null
}

const UPSTREAM_TTL_MS = 60_000
let cached: { at: number; data: Payload } | null = null
let inflight: Promise<Payload> | null = null

const posfinite = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

async function alchemyPrices(mints: string[]): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {}
  for (const m of mints) out[m] = null
  const key = process.env.ALCHEMY_API_KEY
  if (!key) return out
  try {
    const res = await fetch(`https://api.g.alchemy.com/prices/v1/${key}/tokens/by-address`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        addresses: mints.map((address) => ({ network: "solana-mainnet", address })),
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return out
    const d = (await res.json()) as {
      data?: { address?: string; prices?: { currency?: string; value?: string }[] }[]
    }
    for (const row of d.data ?? []) {
      if (!row.address) continue
      const usd = row.prices?.find((p) => p.currency === "usd")?.value
      out[row.address] = posfinite(usd)
    }
    return out
  } catch {
    return out
  }
}

async function jupiterPrices(mints: string[]): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {}
  for (const m of mints) out[m] = null
  try {
    const res = await fetch(`${JUP_PRICE}?ids=${mints.join(",")}`, {
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) return out
    const data = (await res.json()) as Record<string, { usdPrice?: number; price?: string | number }>
    for (const m of mints) {
      const entry = data[m] ?? (data as { data?: Record<string, { price?: string }> }).data?.[m]
      out[m] = posfinite(entry?.usdPrice ?? entry?.price)
    }
    return out
  } catch {
    return out
  }
}

// USD value of one whole token via a real 1-unit -> USDC quote: the price a
// swap would actually route at. Last-resort fallback for mints the price
// feeds miss (Token-2022 PAXG in particular).
async function unitQuoteUsd(mint: string, decimals: number): Promise<number | null> {
  try {
    const amount = 10 ** decimals
    const r = await fetch(
      `${JUP_QUOTE}?inputMint=${mint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`,
      { signal: AbortSignal.timeout(8_000) },
    )
    if (!r.ok) return null
    const d = (await r.json()) as { outAmount?: string }
    if (!d.outAmount) return null
    return posfinite(Number(d.outAmount) / 10 ** USDC_DECIMALS)
  } catch {
    return null
  }
}

async function jitoApy(): Promise<number | null> {
  try {
    const r = await fetch(KOBE, { signal: AbortSignal.timeout(8_000) })
    if (!r.ok) return null
    const d = (await r.json()) as { apy?: { data?: number; date?: string }[] }
    const series = Array.isArray(d.apy) ? d.apy : []
    const latest = series.length ? series[series.length - 1]?.data : null
    return typeof latest === "number" && latest > 0 && latest < 1 ? latest : null
  } catch {
    return null
  }
}

async function fetchMarket(): Promise<Payload> {
  const mints = [WSOL_MINT, PAXG_MINT, JITOSOL_MINT]
  const [alch, apy] = await Promise.all([alchemyPrices(mints), jitoApy()])

  const missing = mints.filter((m) => alch[m] == null)
  const jup = missing.length ? await jupiterPrices(missing) : {}
  const priceOf = (m: string) => alch[m] ?? jup[m] ?? null

  let paxgUsd = priceOf(PAXG_MINT)
  let jitoUsd = priceOf(JITOSOL_MINT)
  if (paxgUsd == null) paxgUsd = await unitQuoteUsd(PAXG_MINT, PAXG_DECIMALS)
  if (jitoUsd == null) jitoUsd = await unitQuoteUsd(JITOSOL_MINT, JITOSOL_DECIMALS)

  return { solUsd: priceOf(WSOL_MINT), paxgUsd, jitoUsd, jitoApy: apy }
}

export async function GET() {
  const now = Date.now()
  if (cached && now - cached.at < UPSTREAM_TTL_MS) {
    return Response.json(cached.data, {
      headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
    })
  }
  if (!inflight) {
    inflight = fetchMarket().finally(() => {
      inflight = null
    })
  }
  const data = await inflight
  // Keep serving the last good values through a transient upstream failure.
  if (data.solUsd == null && data.paxgUsd == null && cached) {
    return Response.json(cached.data, {
      headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
    })
  }
  cached = { at: Date.now(), data }
  return Response.json(data, {
    headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
  })
}

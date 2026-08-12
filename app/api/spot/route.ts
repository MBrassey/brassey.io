// Live USD spot prices + 24h change for a set of Solana mints.
//
// Alchemy is the primary source (the key stays server-side, as everywhere else
// on this site); Jupiter's price feed fills anything Alchemy doesn't cover and
// takes over wholesale when the Alchemy quota is exhausted, so the displayed
// figures never go stale or blank. Every value here is a real market read —
// nothing is fabricated, and a price that cannot be established comes back null
// so the surface can show a dash instead of a confident wrong number.
//
// One upstream read per 30s window is shared across all visitors, which also
// keeps a public page from burning the Alchemy quota.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const MAX_MINTS = 8
const TTL_MS = 30_000

export interface Spot {
  usd: number | null
  change24h: number | null
}
type Payload = Record<string, Spot>

const cache = new Map<string, { at: number; body: Payload }>()
const inflight = new Map<string, Promise<Payload>>()

const posfinite = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}
const finite = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Current USD price per mint from Alchemy's Prices API. */
async function alchemySpot(mints: string[]): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {}
  for (const m of mints) out[m] = null
  const key = process.env.ALCHEMY_API_KEY
  if (!key) return out
  try {
    const res = await fetch(`https://api.g.alchemy.com/prices/v1/${key}/tokens/by-address`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ addresses: mints.map((address) => ({ network: "solana-mainnet", address })) }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return out
    const d = (await res.json()) as {
      data?: { address?: string; prices?: { currency?: string; value?: string }[] }[]
    }
    for (const row of d.data ?? []) {
      if (!row.address) continue
      out[row.address] = posfinite(row.prices?.find((p) => p.currency === "usd")?.value)
    }
    return out
  } catch {
    return out
  }
}

/**
 * 24h change from Alchemy's historical series: the oldest close inside the
 * window versus the live price. Alchemy quotes no change field of its own, so
 * this is derived rather than taken on trust.
 */
async function alchemyChange24h(mint: string, nowUsd: number | null): Promise<number | null> {
  const key = process.env.ALCHEMY_API_KEY
  if (!key || nowUsd == null) return null
  try {
    const end = new Date()
    const start = new Date(end.getTime() - 26 * 3600_000)
    const res = await fetch(`https://api.g.alchemy.com/prices/v1/${key}/tokens/historical`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        network: "solana-mainnet",
        address: mint,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        interval: "1h",
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null
    const d = (await res.json()) as { data?: { value?: string; timestamp?: string }[] }
    const series = (d.data ?? [])
      .map((p) => ({ v: posfinite(p.value), t: p.timestamp ? Date.parse(p.timestamp) : NaN }))
      .filter((p): p is { v: number; t: number } => p.v != null && Number.isFinite(p.t))
      .sort((a, b) => a.t - b.t)
    if (series.length === 0) return null
    // The sample closest to exactly 24h ago, so the window is what it claims.
    const target = Date.now() - 24 * 3600_000
    const then = series.reduce((best, p) => (Math.abs(p.t - target) < Math.abs(best.t - target) ? p : best))
    if (then.v <= 0) return null
    return ((nowUsd - then.v) / then.v) * 100
  } catch {
    return null
  }
}

/** Jupiter's price feed — usdPrice plus its own 24h change. The fallback leg. */
async function jupiterSpot(mints: string[]): Promise<Record<string, Spot>> {
  const out: Record<string, Spot> = {}
  for (const m of mints) out[m] = { usd: null, change24h: null }
  try {
    const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mints.join(",")}`, {
      signal: AbortSignal.timeout(6_000),
    })
    if (!res.ok) return out
    const data = (await res.json()) as Record<
      string,
      { usdPrice?: number; price?: string | number; priceChange24h?: number }
    >
    for (const m of mints) {
      const e = data[m] ?? (data as { data?: Record<string, typeof data[string]> }).data?.[m]
      if (!e) continue
      out[m] = { usd: posfinite(e.usdPrice ?? e.price), change24h: finite(e.priceChange24h) }
    }
    return out
  } catch {
    return out
  }
}

async function build(mints: string[]): Promise<Payload> {
  const [alch, jup] = await Promise.all([alchemySpot(mints), jupiterSpot(mints)])

  // Alchemy's historical leg is a call per mint, so only ask for the ones whose
  // change Jupiter couldn't supply — and only when Alchemy priced them at all.
  const needChange = mints.filter((m) => jup[m]?.change24h == null && alch[m] != null)
  const derived = Object.fromEntries(
    await Promise.all(needChange.map(async (m) => [m, await alchemyChange24h(m, alch[m])] as const)),
  ) as Record<string, number | null>

  const out: Payload = {}
  for (const m of mints) {
    out[m] = {
      usd: alch[m] ?? jup[m]?.usd ?? null,
      change24h: jup[m]?.change24h ?? derived[m] ?? null,
    }
  }
  return out
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("mints") ?? ""
  const mints = [...new Set(raw.split(",").map((m) => m.trim()).filter((m) => MINT_RE.test(m)))].slice(0, MAX_MINTS)
  if (mints.length === 0) return Response.json({ error: "no valid mints" }, { status: 400 })

  const cacheKey = mints.slice().sort().join(",")
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < TTL_MS) {
    return Response.json(hit.body, { headers: { "cache-control": "no-store" } })
  }
  try {
    let p = inflight.get(cacheKey)
    if (!p) {
      p = build(mints).finally(() => inflight.delete(cacheKey))
      inflight.set(cacheKey, p)
    }
    const body = await p
    // Keep the last good payload if this round established nothing at all.
    if (Object.values(body).every((s) => s.usd == null) && hit) {
      return Response.json(hit.body, { headers: { "cache-control": "no-store" } })
    }
    cache.set(cacheKey, { at: Date.now(), body })
    return Response.json(body, { headers: { "cache-control": "no-store" } })
  } catch {
    if (hit) return Response.json(hit.body, { headers: { "cache-control": "no-store" } })
    return Response.json({ error: "upstream" }, { status: 502 })
  }
}

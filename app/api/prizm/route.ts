// Server-side proxy for the PRIZM trading demo.
//
// prizm.trading serves its market data through same-origin routes with strict
// endpoint allowlists, so the browser here can't call them directly. This route
// fetches them server-to-server and collapses all visitor traffic onto one
// upstream read per window, the same pattern /api/canton uses.
//
// Two datasets, one hop each:
//   candles, OHLCV for the chart (GeckoTerminal via PRIZM's cache)
//   trades , recent executed flow for the order book's basins and ladder

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UPSTREAM = "https://www.prizm.trading"
// Only these two datasets, and only the shapes below, are ever forwarded.
const KINDS = { candles: 8_000, trades: 4_000, tokens: 60_000 } as const
type Kind = keyof typeof KINDS
const TIMEFRAMES = new Set(["1m", "5m", "15m", "1h", "4h", "1d"])
// Base58, the only shape a Solana mint takes, never interpolate raw input.
const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

const cache = new Map<string, { at: number; body: unknown }>()
const inflight = new Map<string, Promise<unknown>>()

async function upstream(path: string): Promise<unknown> {
  const res = await fetch(`${UPSTREAM}${path}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`prizm ${res.status}`)
  return res.json()
}

/**
 * PRIZM hands back logo paths relative to its own origin; point them at this
 * site's image proxy so the browser still only ever talks to `self` (and the
 * canvas can read the pixels for the duotone pass without a taint error).
 */
function rewriteLogos(body: unknown): unknown {
  const b = body as { tokens?: { logo?: string; mint?: string }[] } | null
  if (!b?.tokens) return body
  return {
    ...b,
    tokens: b.tokens.map((t) => (t.mint ? { ...t, logo: `/api/prizm/logo/${t.mint}` } : t)),
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const kind = url.searchParams.get("kind") as Kind | null
  const mint = url.searchParams.get("mint") ?? ""
  const tf = url.searchParams.get("tf") ?? "15m"

  if (!kind || !(kind in KINDS)) return Response.json({ error: "bad kind" }, { status: 400 })
  // The token list is market-wide; the other two are per-mint.
  if (kind !== "tokens" && !MINT_RE.test(mint)) return Response.json({ error: "bad mint" }, { status: 400 })
  if (kind === "candles" && !TIMEFRAMES.has(tf)) return Response.json({ error: "bad tf" }, { status: 400 })

  const path =
    kind === "candles"
      ? `/api/candles?mint=${mint}&tf=${tf}&limit=240`
      : kind === "tokens"
        ? "/api/tokens"
        : `/api/trades?mint=${mint}`
  const ttl = KINDS[kind]
  const now = Date.now()

  const hit = cache.get(path)
  if (hit && now - hit.at < ttl) {
    return Response.json(kind === "tokens" ? rewriteLogos(hit.body) : hit.body, {
      headers: { "cache-control": "no-store" },
    })
  }

  try {
    let p = inflight.get(path)
    if (!p) {
      p = upstream(path).finally(() => inflight.delete(path))
      inflight.set(path, p)
    }
    const body = await p
    cache.set(path, { at: Date.now(), body })
    return Response.json(kind === "tokens" ? rewriteLogos(body) : body, {
      headers: { "cache-control": "no-store" },
    })
  } catch {
    // Serve the last good payload rather than blanking a live surface.
    if (hit) return Response.json(hit.body, { headers: { "cache-control": "no-store" } })
    return Response.json({ error: "upstream" }, { status: 502 })
  }
}

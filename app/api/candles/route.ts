// Candles for the PRIZM chart, keyed feeds only.
//
// The chart used to read GeckoTerminal through prizm.trading's proxy: an
// unkeyed public feed that returned an empty series often enough that the chart
// frequently sat in its skeleton. Both legs here are keyed:
//
//   1. Jupiter's chart API (Pro key), real OHLC *and* real volume.
//   2. Alchemy's historical prices, folded into OHLC, no volume, so the
//      histogram is hidden rather than faked when this leg serves.
//
// A short shared cache in front of them means a switch between markets or
// timeframes is served locally instead of waiting on an upstream round trip.

import { MINT_RE, TF_PLAN, alchemySeries, cached, jupiterCandles, toCandles, type Candle } from "@/lib/market"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TTL_MS = 20_000

interface Payload {
  candles: Candle[]
  pool: { name: string } | null
  /** Which leg served this, and whether the candles carry real volume. */
  source: "jupiter" | "alchemy" | null
  volume: boolean
}

async function build(mint: string, tf: string): Promise<Payload> {
  // Jupiter's keyed chart feed first: it is the only source here with volume.
  const jup = await jupiterCandles(mint, tf)
  if (jup.length >= 8) {
    return { candles: jup.slice(-240), pool: null, source: "jupiter", volume: true }
  }

  // Otherwise fold Alchemy's historical prices into candles. One sample per
  // bucket cannot describe a candle, so require several before trusting it.
  const plan = TF_PLAN[tf]
  const series = await alchemySeries(mint, plan.interval, plan.hours)
  const candles = toCandles(series, plan.bucket)
  if (candles.length > 0 && series.length > candles.length) {
    return { candles: candles.slice(-240), pool: null, source: "alchemy", volume: false }
  }
  // Thin is still better than an empty chart, and whatever Jupiter had beats none.
  if (jup.length > 0) return { candles: jup, pool: null, source: "jupiter", volume: true }
  if (candles.length > 0) return { candles, pool: null, source: "alchemy", volume: false }
  return { candles: [], pool: null, source: null, volume: false }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mint = url.searchParams.get("mint") ?? ""
  const tf = url.searchParams.get("tf") ?? "15m"
  if (!MINT_RE.test(mint)) return Response.json({ error: "bad mint" }, { status: 400 })
  if (!TF_PLAN[tf]) return Response.json({ error: "bad tf" }, { status: 400 })

  const body = await cached<Payload>(
    `candles:${mint}:${tf}`,
    TTL_MS,
    () => build(mint, tf),
    (v) => v.candles.length > 0,
  )
  return Response.json(body ?? { candles: [], pool: null, source: null, volume: false }, {
    headers: { "cache-control": "no-store" },
  })
}

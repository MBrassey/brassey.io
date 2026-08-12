// Shared, server-only market data. Every price, change, cross-rate and candle
// on this site comes through here, so one source of truth backs them all.
//
// Alchemy is primary, its Prices API is the most reliable feed available with
// the key this site holds, and the key never leaves the server. Jupiter is the
// fallback leg for anything Alchemy does not cover or when its quota is spent.
// Nothing here is ever fabricated: a value that cannot be established comes
// back null so the surface shows a dash instead of a confident wrong number.
//
// Note on transports: Alchemy publishes no price websocket (its WS is chain
// JSON-RPC, accountSubscribe and friends, not token prices), so "live" here
// means a short server-side cache in front of the REST feed, shared across all
// visitors. That is both faster and far more reliable for a public page than a
// per-visitor socket, and it keeps the quota from being burned by traffic.

const ALCHEMY_PRICES = "https://api.g.alchemy.com/prices/v1"
const JUP_PRICE = "https://api.jup.ag/price/v3"
const JUP_CHARTS = "https://datapi.jup.ag/v2/charts"

export const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export interface Spot {
  usd: number | null
  change24h: number | null
}

export interface Candle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

const posfinite = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}
const finite = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const key = () => process.env.ALCHEMY_API_KEY ?? ""

// =========================================================
// SHARED CACHE (one upstream read per window, all visitors)
// =========================================================

const cache = new Map<string, { at: number; body: unknown }>()
const inflight = new Map<string, Promise<unknown>>()

/**
 * Serve `k` from cache when fresh, otherwise fetch once and share that promise
 * with every concurrent caller. On failure the last good value is served rather
 * than blanking a live surface; `keep` decides whether a result is worth
 * caching at all (so an all-null round doesn't evict good data).
 */
export async function cached<T>(
  k: string,
  ttlMs: number,
  build: () => Promise<T>,
  keep: (v: T) => boolean = () => true,
): Promise<T | null> {
  const hit = cache.get(k) as { at: number; body: T } | undefined
  if (hit && Date.now() - hit.at < ttlMs) return hit.body
  try {
    let p = inflight.get(k) as Promise<T> | undefined
    if (!p) {
      p = build().finally(() => inflight.delete(k))
      inflight.set(k, p)
    }
    const body = await p
    if (keep(body)) cache.set(k, { at: Date.now(), body })
    else if (hit) return hit.body
    return body
  } catch {
    return hit ? hit.body : null
  }
}

// =========================================================
// SPOT PRICES
// =========================================================

/** Current USD price per mint from Alchemy's Prices API. */
export async function alchemySpot(mints: string[]): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {}
  for (const m of mints) out[m] = null
  if (!key() || mints.length === 0) return out
  try {
    const res = await fetch(`${ALCHEMY_PRICES}/${key()}/tokens/by-address`, {
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

/** Jupiter's price feed, usdPrice plus its own 24h change. The fallback leg. */
export async function jupiterSpot(mints: string[]): Promise<Record<string, Spot>> {
  const out: Record<string, Spot> = {}
  for (const m of mints) out[m] = { usd: null, change24h: null }
  if (mints.length === 0) return out
  // Keyed host only, this site does not read unkeyed public feeds.
  const jk = process.env.JUPITER_API_KEY
  if (!jk) return out
  try {
    const res = await fetch(`${JUP_PRICE}?ids=${mints.join(",")}`, {
      headers: { "x-api-key": jk, accept: "application/json" },
      signal: AbortSignal.timeout(6_000),
    })
    if (!res.ok) return out
    const data = (await res.json()) as Record<
      string,
      { usdPrice?: number; price?: string | number; priceChange24h?: number }
    >
    for (const m of mints) {
      const e = data[m] ?? (data as { data?: Record<string, (typeof data)[string]> }).data?.[m]
      if (!e) continue
      out[m] = { usd: posfinite(e.usdPrice ?? e.price), change24h: finite(e.priceChange24h) }
    }
    return out
  } catch {
    return out
  }
}

// =========================================================
// HISTORICAL SERIES → CANDLES
// =========================================================

export type Interval = "5m" | "1h" | "1d"

/** A raw price series from Alchemy, oldest first. */
export async function alchemySeries(
  mint: string,
  interval: Interval,
  hours: number,
): Promise<{ t: number; v: number }[]> {
  if (!key()) return []
  try {
    const end = new Date()
    const start = new Date(end.getTime() - hours * 3600_000)
    const res = await fetch(`${ALCHEMY_PRICES}/${key()}/tokens/historical`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        network: "solana-mainnet",
        address: mint,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        interval,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return []
    const d = (await res.json()) as { data?: { value?: string; timestamp?: string }[] }
    return (d.data ?? [])
      .map((p) => ({ v: posfinite(p.value), t: p.timestamp ? Math.floor(Date.parse(p.timestamp) / 1000) : NaN }))
      .filter((p): p is { t: number; v: number } => p.v != null && Number.isFinite(p.t))
      .sort((a, b) => a.t - b.t)
  } catch {
    return []
  }
}

/** 24h change derived from the series: the sample nearest 24h ago vs now. */
export function change24hFrom(series: { t: number; v: number }[], nowUsd: number | null): number | null {
  if (nowUsd == null || series.length === 0) return null
  const target = Math.floor(Date.now() / 1000) - 24 * 3600
  const then = series.reduce((best, p) => (Math.abs(p.t - target) < Math.abs(best.t - target) ? p : best))
  if (then.v <= 0) return null
  return ((nowUsd - then.v) / then.v) * 100
}

/**
 * Fold a price series into OHLC candles of `bucketSec`.
 *
 * Alchemy quotes one price per interval, not OHLC, so a candle is only honest
 * when several samples land inside it, hence the finer source interval per
 * timeframe below. Volume is NOT part of this feed and is left at zero rather
 * than invented; the chart hides its histogram when the candles carry none.
 */
export function toCandles(series: { t: number; v: number }[], bucketSec: number): Candle[] {
  const buckets = new Map<number, number[]>()
  for (const p of series) {
    const b = Math.floor(p.t / bucketSec) * bucketSec
    const arr = buckets.get(b)
    if (arr) arr.push(p.v)
    else buckets.set(b, [p.v])
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, vs]) => ({
      t,
      o: vs[0],
      h: Math.max(...vs),
      l: Math.min(...vs),
      c: vs[vs.length - 1],
      v: 0,
    }))
}

/** Jupiter's chart intervals, keyed by our timeframe labels. */
const JUP_INTERVAL: Record<string, string> = {
  "5m": "5_MINUTE",
  "15m": "15_MINUTE",
  "1h": "1_HOUR",
  "4h": "4_HOUR",
  "1d": "1_DAY",
}

/**
 * OHLCV candles from Jupiter's keyed chart feed, real open/high/low/close AND
 * real volume, which the price feeds cannot give. This is the primary candle
 * source; Alchemy's historical series is the fallback (see toCandles).
 */
export async function jupiterCandles(mint: string, tf: string, want = 240): Promise<Candle[]> {
  const interval = JUP_INTERVAL[tf]
  const jk = process.env.JUPITER_API_KEY
  if (!interval || !jk) return []
  try {
    const to = new Date().toISOString()
    const res = await fetch(`${JUP_CHARTS}/${mint}?interval=${interval}&candles=${want}&to=${to}`, {
      headers: { "x-api-key": jk, accept: "application/json" },
      signal: AbortSignal.timeout(9_000),
    })
    if (!res.ok) return []
    const d = (await res.json()) as {
      candles?: { time?: number; open?: number; high?: number; low?: number; close?: number; volume?: number }[]
    }
    return (d.candles ?? [])
      .map((c) => ({
        t: Number(c.time),
        o: Number(c.open),
        h: Number(c.high),
        l: Number(c.low),
        c: Number(c.close),
        v: Number(c.volume) || 0,
      }))
      .filter((c) => [c.t, c.o, c.h, c.l, c.c].every((n) => Number.isFinite(n) && n > 0))
      .sort((a, b) => a.t - b.t)
  } catch {
    return []
  }
}

export const SOL_MINT = "So11111111111111111111111111111111111111112"
export const JITOSOL_MINT = "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"

/**
 * jitoSOL's staking APY, derived from keyed price history instead of Jito's
 * public stats feed.
 *
 * A liquid-staking token accrues by appreciating against its underlying, so the
 * growth of the jitoSOL/SOL ratio over a window IS the realised yield: take the
 * ratio 30 days ago and now, and annualise. Returns null when either series is
 * unavailable, an APY is never guessed on a money surface.
 */
export async function jitoApyFromRatio(): Promise<number | null> {
  const days = 30
  const [jito, sol] = await Promise.all([
    alchemySeries(JITOSOL_MINT, "1d", days * 24 + 48),
    alchemySeries(SOL_MINT, "1d", days * 24 + 48),
  ])
  if (jito.length < 5 || sol.length < 5) return null
  // Pair the two series by nearest timestamp so the ratio is same-moment.
  const nearest = (arr: { t: number; v: number }[], t: number) =>
    arr.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best))
  const last = jito[jito.length - 1]
  const first = jito[0]
  const rNow = last.v / nearest(sol, last.t).v
  const rThen = first.v / nearest(sol, first.t).v
  const span = (last.t - first.t) / 86400
  if (!(rNow > 0) || !(rThen > 0) || span < 5) return null
  const growth = rNow / rThen
  // Annualise the observed ratio growth; clamp to a sane band so a bad sample
  // can never print an absurd yield.
  const apy = Math.pow(growth, 365 / span) - 1
  return apy > 0 && apy < 0.5 ? apy : null
}

/** Per-timeframe plan: bucket size, the source interval, and how far back. */
export const TF_PLAN: Record<string, { bucket: number; interval: Interval; hours: number }> = {
  "5m": { bucket: 300, interval: "5m", hours: 20 },
  "15m": { bucket: 900, interval: "5m", hours: 60 },
  "1h": { bucket: 3600, interval: "5m", hours: 168 },
  "4h": { bucket: 14400, interval: "1h", hours: 720 },
  "1d": { bucket: 86400, interval: "1h", hours: 2160 },
}

"use client"

/**
 * A live slice of the PRIZM trading terminal (prizm.trading/trade), ported into
 * the portfolio: the candle chart and the order book, running the same code and
 * the same live Solana market data as production, restyled to this site's
 * palette. Data arrives through /api/prizm, a server-side proxy onto PRIZM's own
 * same-origin market routes.
 *
 *  • Chart — TradingView lightweight-charts, candles + volume over the deepest
 *    pool for the mint, polled on a per-timeframe cadence.
 *  • Order book — Solana AMM pairs have no central L2 book, so this is built
 *    honestly from real executed flow: two basins of living liquid (one per
 *    side) holding that side's volume over a rolling window measured against a
 *    slow-decaying peak, over a price-level ladder showing the buy/sell split.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts"

// =========================================================
// MARKETS + HELPERS
// =========================================================

const MARKETS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112" },
  { symbol: "JITOSOL", mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn" },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
] as const

function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return " · "
  if (n === 0) return "$0.00"
  if (n < 0.000001) return "$" + n.toExponential(2)
  if (n < 0.001) return "$" + n.toFixed(7).replace(/0+$/, "")
  if (n < 1) return "$" + n.toFixed(4)
  if (n < 1000) return "$" + n.toFixed(2)
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return " · "
  const abs = Math.abs(n)
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T"
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + "K"
  return n.toFixed(2)
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return " · "
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`
}

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ")

/** Poll a URL, keeping the last good payload through a transient failure. */
function usePolled<T>(url: string | null, intervalMs: number): T | null {
  const [data, setData] = useState<T | null>(null)
  const urlRef = useRef(url)
  urlRef.current = url
  useEffect(() => {
    // Drop the previous url's payload: holding it would show one market's data
    // under another market's label until the first new response lands.
    setData(null)
    if (!url) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null
    const load = async () => {
      try {
        const res = await fetch(urlRef.current as string, { cache: "no-store" })
        if (res.ok) {
          const j = (await res.json()) as T
          if (alive) setData(j)
        }
      } catch {
        /* keep previous value */
      }
      if (alive) timer = setTimeout(load, intervalMs)
    }
    load()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [url, intervalMs])
  return data
}

// =========================================================
// CHART (lightweight-charts, re-skinned)
// =========================================================

interface Candle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

const TIMEFRAMES = ["5m", "15m", "1h", "4h", "1d"] as const
type Timeframe = (typeof TIMEFRAMES)[number]

const POLL: Record<Timeframe, number> = {
  "5m": 10_000,
  "15m": 15_000,
  "1h": 30_000,
  "4h": 60_000,
  "1d": 120_000,
}
const RESOLVE_POLL = 8_000
const EMPTY_TOLERANCE = 2
const RETRY_MAX = 30_000

// Muted green/red: still unmistakably buy/sell, but desaturated into the
// site's wireframe palette rather than trading-terminal neon.
const UP = "#5A9B82"
const DOWN = "#A5726F"

function TradeChart({ mint, className }: { mint: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const [tf, setTf] = useState<Timeframe>("15m")
  const [state, setState] = useState<"loading" | "live" | "retrying">("loading")
  const [poolName, setPoolName] = useState<string | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6BA3BF",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(75,127,155,0.05)" },
        horzLines: { color: "rgba(75,127,155,0.05)" },
      },
      rightPriceScale: { borderColor: "rgba(75,127,155,0.12)" },
      timeScale: {
        borderColor: "rgba(75,127,155,0.12)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(75,127,155,0.45)", labelBackgroundColor: "#14242b" },
        horzLine: { color: "rgba(75,127,155,0.45)", labelBackgroundColor: "#14242b" },
      },
      // A plain scroll over the chart scrolls the PAGE; wheel-zoom arms on click
      // (released when the pointer leaves) or while Shift is held.
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
    })
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: "rgba(90,155,130,0.85)",
      wickDownColor: "rgba(165,114,111,0.8)",
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
    })
    const vol = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      color: "rgba(75,127,155,0.28)",
    })
    chart.priceScale("").applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } })
    chartRef.current = chart
    candleRef.current = candles
    volRef.current = vol

    const hint = el.querySelector<HTMLElement>("[data-zoom-hint]")
    let armed = false
    let shift = false
    const setWheel = (on: boolean) =>
      chart.applyOptions({ handleScroll: { mouseWheel: on }, handleScale: { mouseWheel: on } })
    const sync = () => {
      const on = armed || shift
      setWheel(on)
      if (hint) {
        hint.textContent = on ? "scroll to zoom · move away to release" : "click or ⇧-scroll to zoom"
        hint.style.opacity = on ? "0.85" : "0"
      }
    }
    const onEnter = () => {
      if (!armed && !shift && hint) hint.style.opacity = "0.5"
    }
    const onClick = () => {
      armed = true
      sync()
    }
    const onLeave = () => {
      armed = false
      sync()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Shift") return
      shift = e.type === "keydown"
      sync()
    }
    el.addEventListener("mouseenter", onEnter)
    el.addEventListener("click", onClick)
    el.addEventListener("mouseleave", onLeave)
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKey)

    return () => {
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("click", onClick)
      el.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
      chart.remove()
      chartRef.current = null
      candleRef.current = null
      volRef.current = null
    }
  }, [])

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    let first = true
    let live = false
    let empties = 0
    setState("loading")
    // Wipe the previous market immediately — otherwise its candles sit under
    // the skeleton until the new ones arrive, which reads as a stuck chart.
    candleRef.current?.setData([])
    volRef.current?.setData([])
    setPoolName(null)

    const onNoData = () => {
      empties += 1
      if (!live) setState(empties >= EMPTY_TOLERANCE ? "retrying" : "loading")
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/prizm?kind=candles&mint=${mint}&tf=${tf}`, { cache: "no-store" })
        if (!res.ok) throw new Error(String(res.status))
        const j = (await res.json()) as { candles: Candle[]; pool: { name: string } | null }
        if (!alive) return
        setPoolName(j.pool?.name ?? null)
        if (!j.candles || j.candles.length === 0) {
          onNoData()
        } else {
          empties = 0
          live = true
          const last = j.candles[j.candles.length - 1].c
          const precision = last >= 1000 ? 2 : last >= 1 ? 3 : last >= 0.001 ? 6 : 9
          candleRef.current?.applyOptions({
            priceFormat: { type: "price", precision, minMove: 1 / 10 ** precision },
          })
          candleRef.current?.setData(
            j.candles.map((c) => ({
              time: c.t as UTCTimestamp,
              open: c.o,
              high: c.h,
              low: c.l,
              close: c.c,
            })),
          )
          volRef.current?.setData(
            j.candles.map((c) => ({
              time: c.t as UTCTimestamp,
              value: c.v,
              color: c.c >= c.o ? "rgba(90,155,130,0.3)" : "rgba(165,114,111,0.28)",
            })),
          )
          if (first) {
            chartRef.current?.timeScale().fitContent()
            first = false
          }
          setState("live")
        }
      } catch {
        if (!alive) return
        onNoData()
      }
      if (!alive) return
      const delay = live
        ? POLL[tf]
        : empties < EMPTY_TOLERANCE
          ? Math.min(POLL[tf], RESOLVE_POLL)
          : Math.min(RESOLVE_POLL * (1 + (empties - EMPTY_TOLERANCE) * 0.5), RETRY_MAX)
      timer = setTimeout(load, delay)
    }
    load()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [mint, tf])

  return (
    <div className={cx("glass-pane relative flex flex-col overflow-hidden rounded-lg", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.05] px-3 py-2">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              className={cx(
                "rounded px-2 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B7F9B]/60",
                tf === t
                  ? "bg-[#4B7F9B]/14 text-[#6BA3BF] shadow-[inset_0_0_0_1px_rgb(75_127_155/0.35)]"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
          {poolName ? `${poolName} · usd` : "deepest pool · usd"}
        </span>
      </div>
      <div className="relative min-h-[300px] flex-1" ref={wrapRef}>
        {state === "loading" && (
          <div className="absolute inset-0 z-10 grid grid-cols-6 gap-3 p-6 opacity-60">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="rounded bg-white/[0.04]"
                style={{ height: `${30 + ((i * 37) % 55)}%`, alignSelf: "end" }}
              />
            ))}
          </div>
        )}
        {state === "retrying" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-[12px] text-slate-500">
            <span className="status-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
            <span>Waiting for chart data… retrying</span>
          </div>
        )}
        <div
          data-zoom-hint
          className="pointer-events-none absolute bottom-1.5 left-2.5 z-10 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400 opacity-0 transition-opacity duration-200"
        >
          click or ⇧-scroll to zoom
        </div>
      </div>
    </div>
  )
}

// =========================================================
// LIQUID BASIN (canvas: fbm body, spring surface, motes)
// =========================================================

type Vec3 = [number, number, number]

const BID: Vec3[] = [
  [0x0a, 0x1c, 0x17],
  [0x1b, 0x3d, 0x33],
  [0x45, 0x7d, 0x6b],
  [0x86, 0xb5, 0xa4],
]
const ASK: Vec3[] = [
  [0x1d, 0x11, 0x12],
  [0x40, 0x25, 0x26],
  [0x83, 0x53, 0x51],
  [0xba, 0x93, 0x90],
]
const BID_MOTE = "165,205,190"
const ASK_MOTE = "210,180,178"

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
function hash2(x: number, y: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return v - Math.floor(v)
}
function vnoise2(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash2(ix, iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1)
  const d = hash2(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}
function fbm2(x: number, y: number): number {
  let v = 0
  let amp = 0.5
  let px = x
  let py = y
  for (let i = 0; i < 3; i++) {
    v += amp * vnoise2(px, py)
    const nx = (0.8 * px - 0.6 * py) * 2.03
    const ny = (0.6 * px + 0.8 * py) * 2.03
    px = nx
    py = ny
    amp *= 0.55
  }
  return v
}
const sstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const mixN = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/**
 * A shallow landscape basin holding living liquid. `fill` is read every frame
 * (pass a function) so a caller can drive the level from continuously changing
 * data without re-rendering React sixty times a second. `silhouette` is the
 * terrain lying under the liquid; `splashes` are queued surface hits.
 */
function LiquidPool({
  fill,
  palette,
  mote,
  silhouette,
  splashes,
}: {
  fill: number | (() => number)
  palette: Vec3[]
  mote: string
  silhouette?: number[]
  splashes?: { current: { x: number; power: number }[] }
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fillRef = useRef<number | (() => number)>(fill)
  fillRef.current = fill
  const palRef = useRef(palette)
  palRef.current = palette
  const moteRef = useRef(mote)
  moteRef.current = mote
  const silRef = useRef(silhouette)
  silRef.current = silhouette
  const splashRef = useRef(splashes)
  splashRef.current = splashes

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const NEB_W = 40
    const NEB_H = 20
    const neb = document.createElement("canvas")
    neb.width = NEB_W
    neb.height = NEB_H
    const nebCtx = neb.getContext("2d")
    const nebImg = nebCtx ? nebCtx.createImageData(NEB_W, NEB_H) : null

    let W = 1
    let H = 1
    let N = 24
    let h = new Array<number>(N).fill(0)
    let v = new Array<number>(N).fill(0)

    const setup = () => {
      const rect = wrap.getBoundingClientRect()
      const nw = Math.max(1, Math.round(rect.width))
      const nh = Math.max(1, Math.round(rect.height))
      if (nw === W && nh === H) return
      W = nw
      H = nh
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const newN = Math.max(24, Math.round(W / 5))
      if (newN !== N) {
        N = newN
        h = new Array<number>(N).fill(0)
        v = new Array<number>(N).fill(0)
      }
    }
    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(wrap)

    const K = 0.012
    const DAMP = 0.976
    const SPREAD = 0.2
    let motes: { x: number; y: number; r: number; vx: number; vy: number }[] = []
    let drops: { x: number; y: number; vx: number; vy: number; life: number }[] = []
    let t = 0
    let raf = 0
    let lastAmb = 0
    let lastMote = 0

    const colAt = (x: number) => Math.max(0, Math.min(N - 1, Math.round((x / W) * (N - 1))))
    const surfacePath = (baseY: number) => {
      ctx.moveTo(0, baseY + h[0])
      for (let i = 1; i < N; i++) {
        const x = (i / (N - 1)) * W
        const y = baseY + h[i]
        const px = ((i - 1) / (N - 1)) * W
        const py = baseY + h[i - 1]
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2)
      }
      ctx.lineTo(W, baseY + h[N - 1])
    }

    const draw = (baseY: number) => {
      ctx.clearRect(0, 0, W, H)
      const pal = palRef.current

      ctx.save()
      ctx.beginPath()
      surfacePath(baseY)
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.clip()

      // Churning fbm body in the palette's own light.
      if (nebCtx && nebImg) {
        const ph = t * 0.05
        const cyc = ((ph % 1) + 1) % 1
        const midC = mixN(pal[1], pal[2], cyc)
        const deepC = mixN(pal[0], [4, 6, 8], 0.35)
        const lightC = mixN(pal[3], [255, 255, 255], 0.2)
        const d = nebImg.data
        for (let yy = 0; yy < NEB_H; yy++) {
          const vv = (yy + 0.5) / NEB_H
          const rowLight = Math.exp(-vv * 4) * 0.3
          const rowDark = 1 - 0.3 * vv
          for (let xx = 0; xx < NEB_W; xx++) {
            const u = (xx + 0.5) / NEB_W
            const n1 = fbm2(u * 3.2 + 1.7 + t * 0.05, vv * 2.2 + 9.2 + t * 0.04)
            const n2 = fbm2(u * 4.4 + n1 * 1.5, vv * 3.1 + t * 0.03)
            const nb = fbm2(u * 2.6 + n2 * 1.7, vv * 2.0 + n1 * 1.3)
            let r = deepC[0] + (midC[0] - deepC[0]) * sstep(0.24, 0.76, nb)
            let g = deepC[1] + (midC[1] - deepC[1]) * sstep(0.24, 0.76, nb)
            let b = deepC[2] + (midC[2] - deepC[2]) * sstep(0.24, 0.76, nb)
            const hi = sstep(0.62, 0.95, nb) * 0.5 + rowLight
            r = (r + (lightC[0] - r) * hi) * rowDark
            g = (g + (lightC[1] - g) * hi) * rowDark
            b = (b + (lightC[2] - b) * hi) * rowDark
            const o = (yy * NEB_W + xx) * 4
            d[o] = r
            d[o + 1] = g
            d[o + 2] = b
            d[o + 3] = 255
          }
        }
        nebCtx.putImageData(nebImg, 0, 0)
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(neb, 0, baseY - 2, W, H - baseY + 2)
      }

      // Terrain: when the side's flow arrived across the window, oldest at the
      // left edge — sediment the basin holds, clipped to the liquid.
      const sil = silRef.current
      if (sil && sil.length > 1) {
        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let i = 0; i < sil.length; i++) {
          const x = (i / (sil.length - 1)) * W
          ctx.lineTo(x, H - clamp01(sil[i]) * H * 0.72)
        }
        ctx.lineTo(W, H)
        ctx.closePath()
        ctx.fillStyle = `rgba(${Math.round(pal[3][0])},${Math.round(pal[3][1])},${Math.round(pal[3][2])},0.18)`
        ctx.fill()
      }

      // Floor caustic.
      const seat = ctx.createLinearGradient(0, H - 3, 0, H)
      seat.addColorStop(0, "rgba(255,255,255,0)")
      seat.addColorStop(1, "rgba(255,255,255,0.14)")
      ctx.fillStyle = seat
      ctx.fillRect(0, H - 3, W, 3)
      ctx.restore()

      // Glossy band riding the surface.
      const bandH = Math.max(4, H * 0.14)
      ctx.beginPath()
      surfacePath(baseY)
      for (let i = N - 1; i >= 0; i--) ctx.lineTo((i / (N - 1)) * W, baseY + h[i] + bandH)
      ctx.closePath()
      const gel = ctx.createLinearGradient(0, baseY - 2, 0, baseY + bandH + 2)
      gel.addColorStop(0, "rgba(255,255,255,0.34)")
      gel.addColorStop(0.5, "rgba(255,255,255,0.09)")
      gel.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = gel
      ctx.fill()

      // Meniscus.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      const bright = `rgb(${Math.round(pal[2][0])},${Math.round(pal[2][1])},${Math.round(pal[2][2])})`
      for (const [lw, alpha, col] of [
        [3.4, 0.13, bright],
        [1.8, 0.3, bright],
        [1, 0.75, "rgba(255,255,255,0.75)"],
      ] as const) {
        ctx.beginPath()
        surfacePath(baseY)
        ctx.strokeStyle = col as string
        ctx.globalAlpha = alpha as number
        ctx.lineWidth = lw as number
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // Suspended motes + splash spray.
      ctx.globalCompositeOperation = "lighter"
      for (const m of motes) {
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2)
        g.addColorStop(0, "rgba(255,255,255,0.7)")
        g.addColorStop(0.45, `rgba(${moteRef.current},0.32)`)
        g.addColorStop(1, `rgba(${moteRef.current},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r * 2, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const d of drops) {
        const rr = 1.7 * d.life + 0.4
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, rr)
        g.addColorStop(0, `rgba(255,255,255,${0.8 * d.life})`)
        g.addColorStop(0.5, `rgba(${moteRef.current},${0.45 * d.life})`)
        g.addColorStop(1, `rgba(${moteRef.current},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(d.x, d.y, rr, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = "source-over"
    }

    const readFill = () => {
      const f = fillRef.current
      const val = typeof f === "function" ? f() : f
      return clamp01(Number.isFinite(val) ? val : 0)
    }

    // The level glides toward its target rather than snapping when a poll lands.
    let shown = readFill()

    const frame = (now: number) => {
      const target = readFill()
      shown += (target - shown) * 0.06
      const baseY = (1 - shown) * H

      if (reduced) {
        for (let i = 0; i < N; i++) h[i] = 0
        draw(baseY)
        raf = requestAnimationFrame(frame)
        return
      }

      t += 0.016

      // Queued fills land as hits on the surface.
      const q = splashRef.current?.current
      if (q && q.length) {
        const s = q.shift()
        if (s) {
          const col = colAt(s.x * W)
          v[col] += 1.6 * s.power
          if (col > 0) v[col - 1] += 0.8 * s.power
          if (col < N - 1) v[col + 1] += 0.8 * s.power
          for (let k = 0; k < 3; k++) {
            const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
            const sp = 0.5 + Math.random() * 1.1 * s.power
            drops.push({
              x: s.x * W + (Math.random() - 0.5) * 4,
              y: baseY,
              vx: Math.cos(ang) * sp,
              vy: Math.sin(ang) * sp * 1.6,
              life: 1,
            })
          }
        }
      }

      if (now - lastAmb > 620) {
        lastAmb = now
        v[1 + Math.floor(Math.random() * (N - 2))] += (Math.random() - 0.5) * 1.5
      }
      for (let i = 0; i < N; i++) {
        v[i] += -K * h[i]
        v[i] *= DAMP
        h[i] += v[i]
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < N; i++) {
          const l = i > 0 ? h[i - 1] : h[i]
          const r = i < N - 1 ? h[i + 1] : h[i]
          v[i] += SPREAD * (l + r - 2 * h[i]) * 0.5
        }
      }

      if (now - lastMote > 420 && shown > 0.06) {
        lastMote = now
        motes.push({
          x: 4 + Math.random() * (W - 8),
          y: H - 2,
          r: 0.5 + Math.random() * 0.9,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.06 + Math.random() * 0.13),
        })
      }
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
      }
      motes = motes.filter((m) => m.y > baseY + h[colAt(m.x)] + 1 && motes.length < 40)
      for (const d of drops) {
        d.x += d.vx
        d.y += d.vy
        d.vy += 0.09
        d.life -= 0.04
      }
      drops = drops.filter((d) => d.life > 0)

      draw(baseY)
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

// =========================================================
// ORDER BOOK (flow basins + price ladder)
// =========================================================

interface TradeRow {
  ts: number
  side: "buy" | "sell"
  priceUsd: number | null
  volUsd: number
  tx: string
}

interface Level {
  price: number
  buy: number
  sell: number
  vol: number
  cum: number
  fromMidPct: number
}

const GROUPS = [
  { label: "0.1%", pct: 0.001 },
  { label: "0.5%", pct: 0.005 },
  { label: "1%", pct: 0.01 },
] as const

const FLOW_MS = 90_000
const WINDOWS = [FLOW_MS, 300_000, 900_000] as const
const WINDOW_LABEL = ["90s", "5m", "15m"] as const
const WIDEN_BELOW = 5
const NARROW_ABOVE = 12
const FLOOR = 0.1
const SPAN = 0.8
const BUCKETS = 22

interface Flow {
  buy: number
  sell: number
  buyN: number
  sellN: number
  ref: number
  win: number
  buyShape: number[]
  sellShape: number[]
}

/** When the flow arrived across the window, oldest at the left edge. */
function shapes(trades: TradeRow[], now: number, windowMs: number): { buy: number[]; sell: number[] } {
  const cutoff = now - windowMs
  const buy = new Array<number>(BUCKETS).fill(0)
  const sell = new Array<number>(BUCKETS).fill(0)
  for (const t of trades) {
    if (t.ts < cutoff || t.ts > now) continue
    const i = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((t.ts - cutoff) / windowMs) * BUCKETS)))
    ;(t.side === "buy" ? buy : sell)[i] += t.volUsd
  }
  const peak = Math.max(1, ...buy, ...sell)
  return { buy: buy.map((v) => v / peak), sell: sell.map((v) => v / peak) }
}

/** Volume on each side inside the window ending at `now`. */
function windowFlow(trades: TradeRow[], now: number, windowMs: number = FLOW_MS) {
  const cutoff = now - windowMs
  let buy = 0
  let sell = 0
  let buyN = 0
  let sellN = 0
  for (const t of trades) {
    if (t.ts < cutoff || t.ts > now) continue
    if (t.side === "buy") {
      buy += t.volUsd
      buyN += 1
    } else {
      sell += t.volUsd
      sellN += 1
    }
  }
  return { buy, sell, buyN, sellN }
}

const flowLevel = (vol: number, ref: number) => FLOOR + SPAN * clamp01(vol / Math.max(ref, 1))

/**
 * Live flow, recomputed every animation frame and deliberately kept out of
 * React state: the levels move continuously as fills age out of the window
 * between polls. Only the printed numbers are pushed to state.
 */
function useFlow(trades: TradeRow[] | null) {
  const tradesRef = useRef<TradeRow[]>([])
  tradesRef.current = trades ?? []

  const live = useRef<Flow>({ buy: 0, sell: 0, buyN: 0, sellN: 0, ref: 0, win: 0, buyShape: [], sellShape: [] })
  const [snap, setSnap] = useState<Flow>(live.current)
  const buySplash = useRef<{ x: number; power: number }[]>([])
  const sellSplash = useRef<{ x: number; power: number }[]>([])
  const pending = useRef<{ side: "buy" | "sell"; power: number }[]>([])
  const seen = useRef<Set<string>>(new Set())
  const primed = useRef(false)

  useEffect(() => {
    const list = trades ?? []
    const cutoff = Date.now() - WINDOWS[WINDOWS.length - 1]
    const fresh = list.filter((t) => t.ts >= cutoff && !seen.current.has(t.tx))
    for (const t of fresh) seen.current.add(t.tx)
    if (seen.current.size > 1200) seen.current = new Set([...seen.current].slice(-600))
    // The first poll is backfill, not news — don't splash a minute of history.
    if (!primed.current) {
      primed.current = true
      return
    }
    const scale = Math.max(live.current.ref, 1)
    for (const t of fresh) {
      pending.current.push({ side: t.side, power: Math.min(1, 0.22 + (t.volUsd / scale) * 2.5) })
    }
    if (pending.current.length > 40) pending.current = pending.current.slice(-40)
  }, [trades])

  useEffect(() => {
    let raf = 0
    let pushedAt = 0
    let releasedAt = 0
    const tick = (now: number) => {
      const at = Date.now()
      let win = live.current.win
      let f = windowFlow(tradesRef.current, at, WINDOWS[win])
      // Step out if this window is too thin to say anything…
      while (win < WINDOWS.length - 1 && f.buyN + f.sellN < WIDEN_BELOW) {
        win += 1
        f = windowFlow(tradesRef.current, at, WINDOWS[win])
      }
      // …and back in once the tighter one carries a real sample again.
      for (;;) {
        if (win === 0) break
        const tighter = windowFlow(tradesRef.current, at, WINDOWS[win - 1])
        if (tighter.buyN + tighter.sellN < NARROW_ABOVE) break
        win -= 1
        f = tighter
      }
      const { buy, sell, buyN, sellN } = f
      live.current = {
        ...live.current,
        buy,
        sell,
        buyN,
        sellN,
        win,
        ref: Math.max(buy, sell, live.current.ref * 0.9997),
      }

      // Release queued fills one at a time — a poll can land eight at once and
      // they should arrive as eight separate hits, not one thump.
      if (pending.current.length && now - releasedAt > 110) {
        releasedAt = now
        const p = pending.current.shift()
        if (p) (p.side === "buy" ? buySplash : sellSplash).current.push({ x: 0.12 + Math.random() * 0.76, power: p.power })
      }
      if (now - pushedAt > 260) {
        pushedAt = now
        const s = shapes(tradesRef.current, at, WINDOWS[win])
        live.current = { ...live.current, buyShape: s.buy, sellShape: s.sell }
        setSnap(live.current)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return { live, snap, buySplash, sellSplash }
}

/**
 * One side of the flow as a basin of its own liquid. Numbers sit on solid ground
 * above the glass rather than over moving colour. The lighter side carries a
 * dashed mark at the heavier side's waterline, so the gap can be read exactly.
 */
function Basin({
  label,
  accent,
  vol,
  n,
  pct,
  level,
  other,
  palette,
  mote,
  ridge,
  splashes,
  lead,
}: {
  label: string
  accent: string
  vol: number
  n: number
  pct: number
  level: () => number
  other: () => number
  palette: Vec3[]
  mote: string
  ridge: number[]
  splashes: { current: { x: number; power: number }[] }
  lead: boolean
}) {
  const mark = other()
  const behind = mark > level() + 0.02
  return (
    <div>
      <div className="mb-1 flex h-4 items-baseline gap-1.5 overflow-hidden whitespace-nowrap">
        <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
          {label}
        </span>
        <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums text-slate-200">
          ${fmtCompact(vol)}
        </span>
        <span className="ml-auto shrink-0 font-mono text-[9px] tabular-nums text-slate-500">
          {Math.round(pct * 100)}% · {n}
        </span>
      </div>
      <div
        className="relative h-16 overflow-hidden rounded-md border bg-black/40 transition-[border-color,box-shadow] duration-500"
        style={{
          borderColor: lead ? `${accent}66` : "rgba(255,255,255,0.05)",
          boxShadow: lead ? `0 2px 20px -8px ${accent}` : "none",
        }}
      >
        <LiquidPool fill={level} palette={palette} mote={mote} silhouette={ridge} splashes={splashes} />
        {behind && (
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/25 transition-[bottom] duration-300"
            style={{ bottom: `${mark * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}

function buildModel(trades: TradeRow[], tickPct: number) {
  const priced = trades.filter((t): t is TradeRow & { priceUsd: number } => t.priceUsd != null && t.volUsd > 0)
  if (priced.length === 0) return null

  const buys = priced.filter((t) => t.side === "buy")
  const sells = priced.filter((t) => t.side === "sell")
  const buyVol = buys.reduce((a, t) => a + t.volUsd, 0)
  const sellVol = sells.reduce((a, t) => a + t.volUsd, 0)

  const last = priced[0].priceUsd
  const tick = Math.max(last * tickPct, Number.MIN_VALUE)

  const byLevel = new Map<number, Level>()
  for (const t of priced) {
    const price = Math.round(t.priceUsd / tick) * tick
    const cur = byLevel.get(price) ?? { price, buy: 0, sell: 0, vol: 0, cum: 0, fromMidPct: 0 }
    if (t.side === "buy") cur.buy += t.volUsd
    else cur.sell += t.volUsd
    cur.vol += t.volUsd
    byLevel.set(price, cur)
  }
  const all = [...byLevel.values()]
  const maxVol = Math.max(...all.map((l) => l.vol), 1)

  const ladder = [...all].sort((a, b) => b.price - a.price).slice(0, 40)
  const midPrice = ladder.reduce(
    (best, l) => (Math.abs(l.price - last) < Math.abs(best - last) ? l.price : best),
    ladder[0]?.price ?? last,
  )
  const midIdx = Math.max(
    0,
    ladder.findIndex((l) => l.price === midPrice),
  )
  ladder.forEach((l, i) => {
    const lo = Math.min(i, midIdx)
    const hi = Math.max(i, midIdx)
    l.cum = ladder.slice(lo, hi + 1).reduce((a, x) => a + x.vol, 0)
    l.fromMidPct = last ? ((l.price - last) / last) * 100 : 0
  })

  return { buyVol, sellVol, last, ladder, maxVol, midPrice }
}

function OrderBook({ mint, className }: { mint: string; className?: string }) {
  const data = usePolled<{ trades: TradeRow[] }>(mint ? `/api/prizm?kind=trades&mint=${mint}` : null, 4_000)
  const trades = data?.trades ?? null
  // 0.1% by default: at a wider tick a $76 pair buckets every recent fill
  // into one price level and the ladder has no shape to show.
  const [groupIdx, setGroupIdx] = useState(0)
  const [hover, setHover] = useState<Level | null>(null)
  const model = useMemo(() => (trades ? buildModel(trades, GROUPS[groupIdx].pct) : null), [trades, groupIdx])
  const { live, snap, buySplash, sellSplash } = useFlow(trades)

  const buyFill = useCallback(() => flowLevel(live.current.buy, live.current.ref), [live])
  const sellFill = useCallback(() => flowLevel(live.current.sell, live.current.ref), [live])

  // Everything in this header answers to the SAME rolling window the basins do,
  // so the printed figures and the liquid can never disagree.
  const flowTotal = snap.buy + snap.sell
  const buyShare = flowTotal > 0 ? snap.buy / flowTotal : 0.5
  const winning = buyShare >= 0.5
  const delta = Math.abs(snap.buy - snap.sell)
  // The basins are always mounted — only the ladder waits on a priced model —
  // so switching markets never tears the panel down and rebuilds it at a
  // different height.
  const ladder = model?.ladder ?? []

  return (
    <div className={cx("glass-pane flex min-h-0 flex-col overflow-hidden rounded-lg", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.05] px-3 py-2">
        <span className="text-[11px] font-semibold text-slate-200">Order book</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">executed flow</span>
      </div>
      <div className="shrink-0 border-b border-white/[0.05] px-3 pb-2.5 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <Basin
            label="Buy"
            accent={UP}
            vol={snap.buy}
            n={snap.buyN}
            pct={buyShare}
            level={buyFill}
            other={sellFill}
            palette={BID}
            mote={BID_MOTE}
            ridge={snap.buyShape}
            splashes={buySplash}
            lead={winning}
          />
          <Basin
            label="Sell"
            accent={DOWN}
            vol={snap.sell}
            n={snap.sellN}
            pct={1 - buyShare}
            level={sellFill}
            other={buyFill}
            palette={ASK}
            mote={ASK_MOTE}
            ridge={snap.sellShape}
            splashes={sellSplash}
            lead={!winning}
          />
        </div>
        <div className="mt-1.5 flex h-4 items-center justify-center gap-x-2 overflow-hidden whitespace-nowrap text-[8.5px] font-bold uppercase tracking-[0.14em]">
          <span className="truncate" style={{ color: winning ? UP : DOWN }}>
            {flowTotal > 0 ? `${winning ? "▲ buyers" : "▼ sellers"} ahead by $${fmtCompact(delta)}` : "waiting on flow"}
          </span>
          <span className="font-mono tracking-normal text-slate-600">· last {WINDOW_LABEL[snap.win] ?? "90s"}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="mr-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-600">group</span>
            {GROUPS.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setGroupIdx(i)}
                className={cx(
                  "rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B7F9B]/60",
                  i === groupIdx ? "bg-[#4B7F9B]/18 text-[#6BA3BF]" : "text-slate-500 hover:text-slate-300",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9.5px] tabular-nums text-slate-500">
            {hover ? (
              <>
                cum <span className="text-slate-300">${fmtCompact(hover.cum)}</span> ·{" "}
                <span style={{ color: hover.fromMidPct >= 0 ? UP : DOWN }}>
                  {hover.fromMidPct >= 0 ? "+" : ""}
                  {hover.fromMidPct.toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="text-slate-600">hover a level</span>
            )}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent onMouseLeave={() => setHover(null)}>
        <div className="sticky top-0 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-white/[0.04] bg-[#0a1418]/90 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600 backdrop-blur-sm">
          <span>Price (usd)</span>
          <span className="text-center">Buy · Sell</span>
          <span className="text-right">Size</span>
        </div>
        {ladder.length === 0 &&
          (trades == null ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="mx-3 my-[5px] h-3.5 rounded bg-white/[0.03]" />
            ))
          ) : (
            <p className="px-3 py-6 text-center text-[11px] leading-relaxed text-slate-600">
              No fills in the window for this pair yet — the ladder is built from
              executed flow, so it stays empty rather than inventing resting orders.
            </p>
          ))}
        {ladder.map((l) => {
          const atMid = l.price === model?.midPrice
          const sellDom = l.sell > l.buy
          const buyW = (l.buy / l.vol) * 100
          const barW = (l.vol / (model?.maxVol ?? 1)) * 100
          return (
            <div
              key={l.price}
              onMouseEnter={() => setHover(l)}
              className={cx(
                "grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-[3.5px] text-left font-mono text-[11px] tabular-nums transition-colors hover:bg-white/[0.05]",
                atMid && "bg-white/[0.035]",
              )}
            >
              <span className="font-semibold" style={{ color: atMid ? "#e2e8f0" : sellDom ? DOWN : UP }}>
                {fmtPrice(l.price)}
              </span>
              <div className="h-3.5 min-w-0" aria-hidden="true">
                <div
                  className="ml-auto flex h-full overflow-hidden rounded-[3px]"
                  style={{ width: `${Math.max(6, barW)}%` }}
                >
                  <div style={{ width: `${buyW}%`, background: `${UP}66` }} />
                  <div style={{ width: `${100 - buyW}%`, background: `${DOWN}66` }} />
                </div>
              </div>
              <span className="w-14 text-right text-slate-400">${fmtCompact(l.vol)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =========================================================
// MARKET HEADER (trade page's Stat + Range24h)
// =========================================================

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="min-w-0">
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</div>
      <div
        className={cx(
          "truncate text-[13px] font-bold tabular-nums",
          tone === "up" ? "text-[#5A9B82]" : tone === "down" ? "text-[#A5726F]" : "text-slate-200",
        )}
      >
        {value}
      </div>
    </div>
  )
}

/** 24h low→high range with the live price marked · derived from 1h candles. */
function Range24h({ mint, price }: { mint: string; price: number | null }) {
  const data = usePolled<{ candles: Candle[] }>(
    mint ? `/api/prizm?kind=candles&mint=${mint}&tf=1h` : null,
    60_000,
  )
  const range = useMemo(() => {
    const cs = (data?.candles ?? []).slice(-24)
    if (cs.length === 0) return null
    const low = Math.min(...cs.map((c) => c.l))
    const high = Math.max(...cs.map((c) => c.h))
    const cur = price ?? cs[cs.length - 1].c
    if (!(high > low) || !Number.isFinite(cur)) return null
    return { low, high, pct: Math.max(0, Math.min(1, (cur - low) / (high - low))) }
  }, [data, price])
  if (!range) return null
  return (
    <div className="flex min-w-[168px] flex-col gap-1">
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-slate-600">24h range</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] tabular-nums text-[#A5726F]">{fmtPrice(range.low)}</span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${range.pct * 100}%`, background: "linear-gradient(90deg,#A5726F88,#5A9B82)" }}
          />
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            style={{ left: `${range.pct * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-[#5A9B82]">{fmtPrice(range.high)}</span>
      </div>
    </div>
  )
}

// =========================================================
// THE EMBEDDED TERMINAL SLICE
// =========================================================

export function PrizmDemo() {
  const [market, setMarket] = useState(0)
  const mint = MARKETS[market].mint

  // Warm every market's candles and tape once the demo mounts, so switching
  // tabs is served from cache instead of waiting on a cold upstream round trip.
  useEffect(() => {
    const ctrl = new AbortController()
    const warm = async () => {
      for (const m of MARKETS.slice(1)) {
        for (const u of [
          `/api/prizm?kind=candles&mint=${m.mint}&tf=15m`,
          `/api/prizm?kind=trades&mint=${m.mint}`,
        ]) {
          try {
            await fetch(u, { signal: ctrl.signal })
          } catch {
            return
          }
        }
      }
    }
    const id = setTimeout(warm, 1200)
    return () => {
      clearTimeout(id)
      ctrl.abort()
    }
  }, [])
  // Live spot + 24h change for every market in the switcher (Alchemy first,
  // Jupiter as fallback), so the chip row and the header agree.
  const spot = usePolled<Record<string, { usd: number | null; change24h: number | null }>>(
    `/api/spot?mints=${MARKETS.map((m) => m.mint).join(",")}`,
    30_000,
  )
  const price = spot?.[mint]?.usd ?? null
  const change = spot?.[mint]?.change24h ?? null
  const sol = spot?.[MARKETS[0].mint]?.usd ?? null
  // Exchange rate against SOL — a real derived cross-rate, not a second quote.
  const inSol = price != null && sol != null && sol > 0 ? price / sol : null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">market</span>
        {MARKETS.map((m, i) => (
          <button
            key={m.mint}
            type="button"
            onClick={() => setMarket(i)}
            aria-pressed={i === market}
            className={cx(
              "rounded-sm border px-2.5 py-1 font-mono text-[11px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4B7F9B]/60",
              i === market
                ? "border-[#4B7F9B]/50 bg-[#4B7F9B]/10 text-[#4B7F9B]"
                : "border-white/[0.07] text-slate-500 hover:border-slate-700 hover:text-slate-300",
            )}
          >
            {m.symbol}/USD
            {spot?.[m.mint]?.change24h != null && (
              <span
                className="ml-1.5 tabular-nums"
                style={{ color: (spot[m.mint].change24h as number) >= 0 ? UP : DOWN }}
              >
                {fmtPct(spot[m.mint].change24h)}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="status-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">live mainnet</span>
        </span>
      </div>

      <div className="glass-pane flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg px-4 py-3">
        <Stat label="Price" value={price != null ? fmtPrice(price) : " · "} />
        <Stat
          label="24h"
          value={fmtPct(change)}
          tone={change == null ? undefined : change >= 0 ? "up" : "down"}
        />
        {market !== 0 && (
          <Stat
            label="vs SOL"
            value={inSol != null ? `${inSol < 1 ? inSol.toFixed(4) : inSol.toFixed(3)} SOL` : " · "}
          />
        )}
        <Range24h mint={mint} price={price} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <TradeChart mint={mint} className="min-h-[340px] lg:h-[560px]" />
        <OrderBook key={mint} mint={mint} className="h-[560px]" />
      </div>
    </div>
  )
}

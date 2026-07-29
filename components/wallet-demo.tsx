"use client"

/**
 * Wireframed, non-custodial Solana wallet demo for the /wallet project page.
 *
 * A live-data preview of a production wallet UI, deliberately de-branded:
 * monochrome wireframe styling on the site palette, generic token marks, and
 * greyed placeholder collectibles. The balances are fixed demo holdings; every
 * USD figure is computed from LIVE market prices (SOL / gold / jitoSOL via
 * /api/wallet-market), so the money surface tracks the market in real time.
 * All controls are inert — nothing routes on chain.
 */

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowUpRight,
  Copy,
  CreditCard,
  Gem,
  History,
  Info,
  Lock,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react"

// =========================================================
// LIVE MARKET DATA (server-proxied; see /api/wallet-market)
// =========================================================

interface Market {
  solUsd: number | null
  paxgUsd: number | null
  jitoUsd: number | null
  jitoApy: number | null
}

// Placeholders shown only until the live feed loads.
const FALLBACK = { solUsd: 150, paxgUsd: 4078, jitoUsd: 92 }

function useWalletMarket(): Market {
  const [m, setM] = useState<Market>({ solUsd: null, paxgUsd: null, jitoUsd: null, jitoApy: null })
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch("/api/wallet-market")
        if (!r.ok) return
        const d = (await r.json()) as Partial<Market>
        if (alive) {
          setM((prev) => ({
            solUsd: typeof d.solUsd === "number" ? d.solUsd : prev.solUsd,
            paxgUsd: typeof d.paxgUsd === "number" ? d.paxgUsd : prev.paxgUsd,
            jitoUsd: typeof d.jitoUsd === "number" ? d.jitoUsd : prev.jitoUsd,
            jitoApy: typeof d.jitoApy === "number" ? d.jitoApy : prev.jitoApy,
          }))
        }
      } catch {
        /* keep prior values */
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])
  return m
}

// =========================================================
// FORMATTERS
// =========================================================

const fmtUsd = (n: number) =>
  "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Truncate (never round up) so the surface never shows more than it holds. */
function formatTokenBalance(value: number, fullDec: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.00"
  const truncated = Math.floor(value * 100 + 1e-9) / 100
  if (truncated === 0) {
    const full = value.toFixed(Math.max(0, fullDec)).replace(/\.?0+$/, "")
    return full === "" || full === "0" ? "0.00" : full
  }
  return truncated.toFixed(2)
}

/** An unknown APY renders as unknown — never a fabricated figure. */
const fmtApy = (apy: number | null) => (apy == null ? "—" : `${(apy * 100).toFixed(2)}%`)

// =========================================================
// TOKENS (generic wireframe identity)
// =========================================================

type TokenKey = "SOL" | "USDC" | "PAXG" | "jitoSOL"

const TOKEN_COLOR: Record<TokenKey, string> = {
  SOL: "#4B7F9B",
  USDC: "#94A3B8",
  PAXG: "#B8AB94",
  jitoSOL: "#4EA88A",
}

/** Generic monochrome marks — wireframe stand-ins, one per asset. */
function SolMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.2 4h13.2l-2.6 3H3.6l2.6-3Z" opacity="0.9" />
      <path d="M3.6 10.5h13.2l2.6 3H6.2l-2.6-3Z" opacity="0.7" />
      <path d="M6.2 17h13.2l-2.6 3H3.6l2.6-3Z" opacity="0.9" />
    </svg>
  )
}
function UsdcMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" strokeWidth="1.8" />
      <path
        d="M14.8 9.3c-.4-1-1.5-1.6-2.8-1.6-1.7 0-2.9.9-2.9 2.2 0 1.1.8 1.7 2.9 2.1 2.1.4 3 1 3 2.2 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.7-3-1.7M12 6v1.7M12 16.4V18"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
function PaxgMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 3.2 20.8 12 12 20.8 3.2 12 12 3.2Z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 7.4 16.6 12 12 16.6 7.4 12 12 7.4Z" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}
function JitoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 3.6s6 6.3 6 10.4a6 6 0 1 1-12 0c0-4.1 6-10.4 6-10.4Z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 14.2a3 3 0 0 0 3 3" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

const MARKS: Record<TokenKey, (p: { className?: string }) => React.JSX.Element> = {
  SOL: SolMark,
  USDC: UsdcMark,
  PAXG: PaxgMark,
  jitoSOL: JitoMark,
}

function TokenLogo({ token, size = 20 }: { token: TokenKey; size?: number }) {
  const Mark = MARKS[token]
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, color: TOKEN_COLOR[token] }}
    >
      <Mark className="h-full w-full" />
    </span>
  )
}

// =========================================================
// LIQUID CAPSULE (canvas gel simulation, wireframe palettes)
// =========================================================

type Vec3 = [number, number, number]
const SOL_PAL: Vec3[] = [
  [0x6b, 0xa3, 0xbf],
  [0x4b, 0x7f, 0x9b],
  [0x3a, 0x63, 0x79],
  [0x2c, 0x4b, 0x5c],
]
const USDC_PAL: Vec3[] = [
  [0xcb, 0xd5, 0xe1],
  [0x94, 0xa3, 0xb8],
  [0x64, 0x74, 0x8b],
  [0x47, 0x55, 0x69],
]
const GOLD_PAL: Vec3[] = [
  [0xd6, 0xcd, 0xbf],
  [0xb8, 0xab, 0x94],
  [0x94, 0x88, 0x6f],
  [0x6e, 0x63, 0x53],
]
const STAKE_PAL: Vec3[] = [
  [0xa7, 0xe0, 0xc8],
  [0x6f, 0xbf, 0x9f],
  [0x4e, 0xa8, 0x8a],
  [0x2f, 0x7a, 0x60],
]
const PALETTES: Record<string, Vec3[]> = { sol: SOL_PAL, usdc: USDC_PAL, gold: GOLD_PAL, stake: STAKE_PAL }
const MOTE: Record<string, string> = {
  sol: "150,190,215",
  usdc: "200,210,225",
  gold: "215,200,175",
  stake: "160,220,195",
}

function hash1(n: number): number {
  const v = Math.sin(n) * 43758.5453123
  return v - Math.floor(v)
}
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
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const sstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const mixN = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
const mix = (a: Vec3, b: Vec3, t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`
function cycleColor(palette: Vec3[], phase: number): string {
  const n = palette.length
  const x = (((phase % 1) + 1) % 1) * n
  const i = Math.floor(x)
  return mix(palette[i % n], palette[(i + 1) % n], x - i)
}

function LiquidCapsule({
  fill,
  variant,
  width = 56,
  height = 128,
  shape = "capsule",
  drip = false,
}: {
  fill: number
  variant: "sol" | "usdc" | "gold" | "stake"
  width?: number
  height?: number
  shape?: "capsule" | "bar"
  drip?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fillRef = useRef(0)
  fillRef.current = Math.max(0, Math.min(1, Number.isFinite(fill) ? fill : 0))
  const variantRef = useRef(variant)
  variantRef.current = variant
  const dripRef = useRef(drip)
  dripRef.current = drip

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const molten = variant === "gold" || variant === "stake"

    const NEB_W = 28
    const NEB_H = 36
    const nebCanvas = document.createElement("canvas")
    nebCanvas.width = NEB_W
    nebCanvas.height = NEB_H
    const nebCtx = nebCanvas.getContext("2d")
    const nebImg = nebCtx ? nebCtx.createImageData(NEB_W, NEB_H) : null

    let W = 1
    let H = 1
    let N = 14
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
      const newN = Math.max(14, Math.round(W / 3))
      if (newN !== N) {
        N = newN
        h = new Array<number>(N).fill(0)
        v = new Array<number>(N).fill(0)
      }
    }
    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(wrap)

    const K = molten ? 0.006 : 0.011
    const DAMP = molten ? 0.987 : 0.981
    const SPREAD = molten ? 0.12 : 0.17
    let bubbles: { x: number; y: number; r: number; vy: number }[] = []
    let t = 0
    let raf = 0
    let lastBub = 0
    let lastAmb = 0
    let lastStaticFill = -1

    let dripY = 6
    let dripVy = 0.5
    let dripFalling = true
    let dripWaitUntil = 0
    let splash: { x: number; y: number; vx: number; vy: number; life: number }[] = []

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
      const charged = fillRef.current >= 0.999
      const palette = PALETTES[variantRef.current] ?? SOL_PAL
      const ph = t * 0.06
      const neon = cycleColor(palette, ph + 0.34)

      ctx.save()
      ctx.beginPath()
      surfacePath(baseY)
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.clip()

      // The body: a slow churning nebula in the asset's muted palette.
      if (nebCtx && nebImg) {
        const cyc = ((ph % 1) + 1) % 1
        const midC = mixN(palette[1], palette[2], cyc)
        const deepC = mixN(palette[3], [10, 10, 12], 0.45)
        const lightC = mixN(palette[0], [255, 255, 255], 0.25)
        const d = nebImg.data
        const tx = t * 0.045
        for (let yy = 0; yy < NEB_H; yy++) {
          const vv = (yy + 0.5) / NEB_H
          const rowLight = Math.exp(-vv * 5) * 0.24
          const rowDark = 1 - 0.38 * vv
          for (let xx = 0; xx < NEB_W; xx++) {
            const u = (xx + 0.5) / NEB_W
            const wx = u * 2.3
            const wy = vv * 3.0
            const n1 = fbm2(wx + 1.7 + tx, wy + 9.2 + t * 0.055)
            const n2 = fbm2(wx * 1.7 + n1 * 1.6, wy * 1.7 + t * 0.028)
            const neb = fbm2(wx * 1.25 + n2 * 1.8, wy * 1.25 + n1 * 1.4)
            let r = deepC[0] + (midC[0] - deepC[0]) * sstep(0.22, 0.78, neb)
            let g = deepC[1] + (midC[1] - deepC[1]) * sstep(0.22, 0.78, neb)
            let b = deepC[2] + (midC[2] - deepC[2]) * sstep(0.22, 0.78, neb)
            const hi = sstep(0.6, 0.96, neb) * 0.45 + rowLight
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
        ctx.drawImage(nebCanvas, 0, baseY - 2, W, H - baseY + 2)
      }

      // Molten heat glowing up from the depths, gently pulsing.
      if (molten) {
        const hot = variantRef.current === "gold" ? "216,200,168" : "160,220,195"
        const pulse = 0.3 + 0.11 * Math.sin(t * 1.4)
        const hg = ctx.createRadialGradient(W / 2, H, W * 0.04, W / 2, H, H * 0.96)
        hg.addColorStop(0, `rgba(${hot},${pulse})`)
        hg.addColorStop(0.5, `rgba(${hot},${pulse * 0.42})`)
        hg.addColorStop(1, `rgba(${hot},0)`)
        ctx.globalCompositeOperation = "lighter"
        ctx.fillStyle = hg
        ctx.fillRect(0, baseY, W, H - baseY)
        ctx.globalCompositeOperation = "source-over"
      }

      // The floor seat: a crisp line of caught light the liquid sits on.
      const seat = ctx.createLinearGradient(0, H - 3.5, 0, H)
      seat.addColorStop(0, "rgba(255,255,255,0)")
      seat.addColorStop(1, "rgba(255,255,255,0.14)")
      ctx.fillStyle = seat
      ctx.fillRect(0, H - 3.5, W, 3.5)
      ctx.restore()

      // Glossy gel band hugging the rippling surface.
      const bandH = Math.max(5, W * 0.22)
      ctx.beginPath()
      surfacePath(baseY)
      for (let i = N - 1; i >= 0; i--) {
        ctx.lineTo((i / (N - 1)) * W, baseY + h[i] + bandH)
      }
      ctx.closePath()
      const gel = ctx.createLinearGradient(0, baseY - 2, 0, baseY + bandH + 3)
      gel.addColorStop(0, "rgba(255,255,255,0.4)")
      gel.addColorStop(0.5, "rgba(255,255,255,0.1)")
      gel.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = gel
      ctx.fill()

      // Meniscus bloom on the crest.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const [lw, la, col] of [
        [charged ? 6 : 4, 0.1, neon],
        [charged ? 3.2 : 2.2, 0.24, neon],
        [1.2, 0.7, "rgba(255,255,255,0.7)"],
      ] as const) {
        ctx.beginPath()
        surfacePath(baseY)
        ctx.strokeStyle = col as string
        ctx.globalAlpha = typeof col === "string" && col.startsWith("rgba") ? 1 : la
        ctx.lineWidth = lw as number
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // Tiny slow motes, drawn additively — suspended pigment.
      const moteRgb = MOTE[variantRef.current] ?? MOTE.sol
      ctx.globalCompositeOperation = "lighter"
      for (const b of bubbles) {
        const stretch = molten ? 2.2 : 1.08
        const rr = b.r * (charged ? 2 : 1.5)
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.scale(1, stretch)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr)
        g.addColorStop(0, charged ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)")
        g.addColorStop(0.45, `rgba(${moteRgb},${charged ? 0.5 : 0.35})`)
        g.addColorStop(1, `rgba(${moteRgb},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, rr, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (dripRef.current) {
        for (const sp of splash) {
          const rr = 1.8 * sp.life + 0.5
          const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, rr)
          g.addColorStop(0, `rgba(255,255,255,${0.8 * sp.life})`)
          g.addColorStop(0.5, `rgba(${moteRgb},${0.45 * sp.life})`)
          g.addColorStop(1, `rgba(${moteRgb},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(sp.x, sp.y, rr, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalCompositeOperation = "source-over"

      // The falling yield droplet while airborne.
      if (dripRef.current && dripFalling && fillRef.current > 0.02) {
        const dx = W / 2
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        const dg = ctx.createRadialGradient(dx, dripY, 0, dx, dripY, 7)
        dg.addColorStop(0, "rgba(255,255,255,0.3)")
        dg.addColorStop(0.5, "rgba(255,255,255,0.1)")
        dg.addColorStop(1, "rgba(255,255,255,0)")
        ctx.fillStyle = dg
        ctx.fillRect(dx - 7, dripY - 7, 14, 14)
        ctx.globalCompositeOperation = "source-over"
        ctx.fillStyle = "rgba(230,238,244,0.92)"
        ctx.beginPath()
        ctx.moveTo(dx, dripY - 4)
        ctx.bezierCurveTo(dx + 2.6, dripY - 1.2, dx + 2.4, dripY + 3, dx, dripY + 3.6)
        ctx.bezierCurveTo(dx - 2.4, dripY + 3, dx - 2.6, dripY - 1.2, dx, dripY - 4)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }

    const frame = (now: number) => {
      const fillNow = fillRef.current
      const baseY = (1 - fillNow) * H

      if (reduced) {
        if (fillNow !== lastStaticFill) {
          lastStaticFill = fillNow
          for (let i = 0; i < N; i++) h[i] = 0
          draw(baseY)
        }
        raf = requestAnimationFrame(frame)
        return
      }

      t += 0.016

      if (now - lastAmb > (molten ? 1100 : 520)) {
        lastAmb = now
        v[1 + Math.floor(Math.random() * (N - 2))] += (Math.random() - 0.5) * (molten ? 1.5 : 2.5)
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
      if (molten) {
        for (let i = 0; i < N; i++) {
          const x = i / N
          v[i] += (Math.sin(t * 0.9 + x * Math.PI * 2.3) + 0.5 * Math.sin(t * 1.5 - x * Math.PI * 3.7)) * 0.04
        }
      }
      const charged = fillNow >= 0.999
      const bubInterval = charged ? 120 : 360
      if (!molten && now - lastBub > bubInterval && fillNow > 0.06) {
        lastBub = now
        const count = charged ? 2 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2)
        for (let k = 0; k < count; k++) {
          const vy = charged ? 0.28 + Math.random() * 0.32 : 0.12 + Math.random() * 0.18
          const r = (charged ? 0.7 : 0.6) + Math.random() * 1.1
          bubbles.push({ x: 5 + Math.random() * (W - 10), y: H - 4, r, vy })
        }
      }
      for (const b of bubbles) {
        b.y -= b.vy
        b.vy += 0.0012
      }
      bubbles = bubbles.filter((b) => {
        const surf = baseY + h[colAt(b.x)]
        if (b.y <= surf + 2) {
          v[colAt(b.x)] -= 0.6
          return false
        }
        return b.y > -4
      })

      if (dripRef.current && fillNow > 0.02) {
        const midCol = colAt(W / 2)
        const surfaceY = baseY + h[midCol]
        if (dripFalling) {
          dripY += dripVy
          dripVy += 0.05
          if (dripY >= surfaceY) {
            v[midCol] += 0.4
            if (midCol > 0) v[midCol - 1] += 0.2
            if (midCol < N - 1) v[midCol + 1] += 0.2
            for (let s = 0; s < 2; s++) {
              const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
              const sp = 0.14 + Math.random() * 0.18
              splash.push({
                x: W / 2 + (Math.random() - 0.5) * 3,
                y: surfaceY,
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp,
                life: 1,
              })
            }
            dripFalling = false
            dripWaitUntil = now + 540
            dripY = 6
            dripVy = 0.5
          }
        } else if (now >= dripWaitUntil) {
          dripFalling = true
        }
      }
      for (const sp of splash) {
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vy += 0.06
        sp.life -= 0.045
      }
      splash = splash.filter((sp) => sp.life > 0)

      draw(baseY)
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const charged = (Number.isFinite(fill) ? fill : 0) >= 0.999
  return (
    <div
      ref={wrapRef}
      className={`wd-cell wd-cell--${variant}${shape === "bar" ? " wd-cell--bar" : ""}${charged ? " wd-cell--charged" : ""}`}
      style={{ width: `min(100%, ${width}px)`, aspectRatio: `${width} / ${height}` }}
      role="img"
      aria-label={`${variant} balance, ${Math.round(fillRef.current * 100)} percent full`}
    >
      <canvas ref={canvasRef} className="wd-cell-canvas" />
      <span className="wd-cell-sheen" aria-hidden="true" />
    </div>
  )
}

// =========================================================
// PORTFOLIO MAP (allocation treemap)
// =========================================================

interface AllocSeg {
  key: TokenKey
  label: string
  amt: number
  dp: number
  fullDec: number
  usd: number
  pct: number
}

function MapTile({ seg, big }: { seg: AllocSeg; big?: boolean }) {
  const c = TOKEN_COLOR[seg.key]
  const amount = formatTokenBalance(seg.amt, seg.fullDec)
  const pctText = `${seg.pct.toFixed(0)}%`
  const value = fmtUsd(seg.usd)
  return (
    <div
      className="relative h-full overflow-hidden rounded border border-white/[0.06] p-2"
      style={{ background: `linear-gradient(150deg, ${c}24, ${c}08)` }}
    >
      {big ? (
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <TokenLogo token={seg.key} size={26} />
            <span className="text-[10px] font-semibold tabular-nums text-slate-500">{pctText}</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold tabular-nums text-slate-200">
              {amount} <span className="text-[11px] font-medium text-slate-500">{seg.label}</span>
            </div>
            <div className="truncate text-[11px] tabular-nums text-slate-400">{value}</div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full items-center gap-2">
          <TokenLogo token={seg.key} size={20} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-baseline justify-between gap-1.5">
              <span className="truncate text-[12px] font-bold tabular-nums text-slate-200">
                {amount} <span className="text-[9px] font-medium text-slate-500">{seg.label}</span>
              </span>
              <span className="shrink-0 text-[9px] font-semibold tabular-nums text-slate-500">{pctText}</span>
            </div>
            <div className="truncate text-[10px] tabular-nums text-slate-400">{value}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function PortfolioMap({ segments, total }: { segments: AllocSeg[]; total: number }) {
  const funded = total > 0
  const sorted = funded ? [...segments].sort((a, b) => b.usd - a.usd) : segments
  const [big, ...rest] = sorted
  const bigW = funded ? Math.min(58, Math.max(36, (big.usd / total) * 100)) : 42
  return (
    <div className="flex h-full min-h-[150px] gap-1.5">
      <div className="shrink-0" style={{ width: `${bigW}%` }}>
        <MapTile seg={big} big />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {rest.map((seg) => (
          <div key={seg.key} className="min-h-[42px] flex-1" style={{ flexGrow: funded ? Math.max(1, seg.usd) : 1 }}>
            <MapTile seg={seg} />
          </div>
        ))}
      </div>
    </div>
  )
}

// =========================================================
// DEMO MODEL (fixed holdings, LIVE prices)
// =========================================================

const DEMO_SOL = 1.35
const DEMO_USDC = 421
const DEMO_PAXG = 0.42
const DEMO_JITOSOL = 14

interface Demo {
  price: number
  paxgUsd: number
  jitoUsd: number
  solVal: number
  goldVal: number
  stakeVal: number
  total: number
  apy: number | null
  alloc: AllocSeg[]
}
function demoFrom(price: number, goldUsd: number, jitoUsd: number, apy: number | null): Demo {
  const solVal = DEMO_SOL * price
  const goldVal = DEMO_PAXG * goldUsd
  const stakeVal = DEMO_JITOSOL * jitoUsd
  const total = solVal + DEMO_USDC + goldVal + stakeVal
  const raw: Omit<AllocSeg, "pct">[] = [
    { key: "SOL", label: "SOL", amt: DEMO_SOL, dp: 4, fullDec: 9, usd: solVal },
    { key: "USDC", label: "USDC", amt: DEMO_USDC, dp: 2, fullDec: 6, usd: DEMO_USDC },
    { key: "PAXG", label: "PAXG", amt: DEMO_PAXG, dp: 4, fullDec: 6, usd: goldVal },
    { key: "jitoSOL", label: "jitoSOL", amt: DEMO_JITOSOL, dp: 4, fullDec: 9, usd: stakeVal },
  ]
  const alloc = raw.map((s) => ({ ...s, pct: (s.usd / total) * 100 }))
  return { price, paxgUsd: goldUsd, jitoUsd, solVal, goldVal, stakeVal, total, apy, alloc }
}

const DEMO_ACTIVITY: { title: string; when: string; amount: string; token: TokenKey; dir: "in" | "out" }[] = [
  { title: "Received USDC", when: "2m ago", amount: "+12.00 USDC", token: "USDC", dir: "in" },
  { title: "Saved to gold", when: "52m ago", amount: "+0.0613 PAXG", token: "PAXG", dir: "in" },
  { title: "Invoice paid", when: "3h ago", amount: "+5.00 USDC", token: "USDC", dir: "in" },
  { title: "Staked SOL", when: "6h ago", amount: "+2.42 jitoSOL", token: "jitoSOL", dir: "in" },
]

const PREVIEW_ADDRESS = "7RzkQ3mBv9TcgquWKehyxpU5ZMjfQVtNBix8s4rrqwXe"

// =========================================================
// CARDS
// =========================================================

function ValueCard({ d }: { d: Demo }) {
  return (
    <div className="wd-glass wd-aurora flex flex-col rounded-lg p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-200">Total value</h3>
            <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Demo
            </span>
          </div>
          <div className="text-3xl sm:text-5xl font-extrabold text-slate-100 tabular-nums mt-2 break-words min-w-0">
            {fmtUsd(d.total)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[#4B7F9B]/10 text-[#4B7F9B]"
            aria-hidden="true"
          >
            <Wallet className="h-10 w-10" strokeWidth={2} />
          </span>
          <span aria-hidden="true" className="p-2.5 rounded-md border border-white/[0.08] text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12a9 9 0 11-2.6-6.4M21 4v5h-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1 min-h-[100px]">
        <PortfolioMap segments={d.alloc} total={d.total} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {["Receive", "Send"].map((label) => (
          <span
            key={label}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-slate-200"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            <Lock className="h-3 w-3 text-emerald-400/80" aria-hidden="true" />
            Your address
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            Non-custodial
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-[#151417] px-3 py-3 font-mono text-[13px] text-[#4B7F9B]">
            {PREVIEW_ADDRESS}
          </code>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.02] text-slate-400">
            <Copy className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.02] text-slate-400">
            <QrCode className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  )
}

function PriceStrip({ d }: { d: Demo }) {
  const cells: { key: TokenKey; price: number }[] = [
    { key: "SOL", price: d.price },
    { key: "USDC", price: 1 },
    { key: "PAXG", price: d.paxgUsd },
    { key: "jitoSOL", price: d.jitoUsd },
  ]
  return (
    <section className="wd-glass rounded-lg p-2.5 sm:p-3" aria-label="Live asset prices">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cells.map((c) => (
          <div
            key={c.key}
            className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5"
          >
            <TokenLogo token={c.key} size={20} />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[11px] font-semibold text-slate-200">{c.key}</div>
              <div className="truncate text-[11px] tabular-nums text-slate-500">{fmtUsd(c.price)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SwapTokenPill({ token }: { token: TokenKey }) {
  const c = TOKEN_COLOR[token]
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold"
      style={{ borderColor: `${c}4d`, background: `${c}14`, color: c }}
    >
      <TokenLogo token={token} size={16} />
      {token}
    </span>
  )
}

function SwapCard({ d }: { d: Demo }) {
  const PAY_USDC = 250
  const receivePaxg = PAY_USDC / d.paxgUsd
  const RECEIVE_TOKENS: [TokenKey, string][] = [
    ["SOL", "native"],
    ["USDC", "stable"],
    ["PAXG", "gold"],
    ["jitoSOL", "staked"],
  ]
  return (
    <div className="wd-glass flex flex-1 flex-col rounded-lg px-4 sm:px-5 py-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-slate-200">Swap</h3>
        <span className="text-[11px] text-slate-500">Any asset, any time · Jupiter</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-md border border-white/[0.05] bg-white/[0.02] p-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
          <TokenLogo token="USDC" size={18} />1 USDC
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-200">
          <span aria-hidden="true">&rarr;</span>
          <TokenLogo token="PAXG" size={18} /> PAXG
        </span>
      </div>

      <div className="relative mt-2.5 rounded-md border border-white/[0.05] bg-white/[0.02] p-2.5">
        <div className="rounded-md border border-white/[0.06] bg-[#151417] p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>You pay</span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums">Balance: {DEMO_USDC.toFixed(2)} USDC</span>
              <span className="shrink-0 rounded border border-[#4B7F9B]/35 bg-[#4B7F9B]/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B7F9B]">
                Max
              </span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="min-w-0 flex-1 text-2xl font-bold text-slate-200 tabular-nums">{PAY_USDC}</span>
            <SwapTokenPill token="USDC" />
          </div>
        </div>

        <div className="flex justify-center">
          <span
            className="relative z-10 -my-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.1] bg-[#151417] text-slate-200"
            aria-hidden="true"
          >
            <ArrowDownUp className="h-4 w-4" />
          </span>
        </div>

        <div className="relative rounded-md border border-white/[0.06] bg-[#151417] p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>You receive</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-2xl font-bold tabular-nums text-slate-200">
              {receivePaxg.toFixed(4)}
            </span>
            <span className="relative shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-sm font-semibold text-slate-200">
                <TokenLogo token="PAXG" size={18} />
                PAXG
              </span>
              <div className="absolute right-0 top-full z-20 mt-1.5 flex gap-1 rounded-md border border-white/[0.1] bg-[#1a191c] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                {RECEIVE_TOKENS.map(([k, hint]) => (
                  <span
                    key={k}
                    className={`relative flex w-[58px] flex-col items-center gap-1 rounded px-1 py-2 ${
                      k === "PAXG"
                        ? "bg-white/[0.07] text-slate-200 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
                        : "text-slate-400"
                    }`}
                  >
                    <TokenLogo token={k} size={26} />
                    <span className="text-[11px] font-semibold leading-none">{k}</span>
                    <span className="text-[9px] leading-none text-slate-500">{hint}</span>
                    {k === "PAXG" && (
                      <svg
                        viewBox="0 0 16 16"
                        width="20"
                        height="20"
                        className="absolute left-[82%] top-[42%] z-30 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1 L1 12.5 L4.2 9.3 L6.6 14.4 L8.7 13.4 L6.2 8.4 L10.6 8.4 Z"
                          fill="#e2e8f0"
                          stroke="#151417"
                          strokeWidth="1.1"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                ))}
              </div>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="mb-2.5 flex min-h-[1.75rem] items-center justify-between gap-2 rounded-md border border-white/[0.04] bg-white/[0.015] px-3 py-1.5 text-[11px] tabular-nums">
          <span className="text-slate-500">Min received</span>
          <span className="text-slate-400">{(receivePaxg * 0.995).toFixed(4)} PAXG</span>
        </div>
        <span className="flex min-h-[44px] w-full items-center justify-center whitespace-nowrap px-5 rounded-md bg-gradient-to-br from-[#4B7F9B] to-[#3A6379] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]">
          Swap USDC &rarr; PAXG
        </span>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
          <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          Swaps settle on Solana with a small network fee in SOL. 0.5% max slippage.
        </p>
      </div>
    </div>
  )
}

function BalanceVial({
  symbol,
  variant,
  note,
  amount,
  usd,
  fill,
  token,
}: {
  symbol: string
  variant: "sol" | "usdc"
  note: string
  amount: string
  usd: string
  fill: number
  token: TokenKey
}) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3">
      <div className="flex items-center gap-4 py-3">
        <LiquidCapsule variant={variant} fill={fill} width={64} height={82} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-bold" style={{ color: TOKEN_COLOR[token] }}>
              {symbol}
            </span>
            <div className="flex flex-col items-end gap-1.5">
              <span className="truncate text-[10px] text-slate-500">{note}</span>
              <TokenLogo token={token} size={24} />
            </div>
          </div>
          <div className="mt-2 break-all text-xl font-bold text-slate-200 tabular-nums">{amount}</div>
          <div className="text-[12px] text-slate-500 tabular-nums">{usd}</div>
        </div>
      </div>
    </div>
  )
}

function BalanceTrend({ total }: { total: number }) {
  const line = "M0 26 L17 24 L33 25 L50 18 L67 19 L83 11 L100 6"
  return (
    <div className="flex h-full flex-col rounded-md border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Net worth trend
          </span>
          <span className="mt-0.5 block text-[10px] text-slate-600">All assets, last 6 epochs</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-emerald-400">+{fmtUsd(total * 0.057)}</span>
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 w-full flex-1 min-h-[48px]" aria-hidden="true">
        <defs>
          <linearGradient id="wd-bt-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(75 127 155 / 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={`${line} L100 32 L0 32 Z`} fill="url(#wd-bt-fill)" stroke="none" />
        <path
          d={line}
          fill="none"
          stroke="#4B7F9B"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

function BalancesCard({ d }: { d: Demo }) {
  return (
    <div className="wd-glass flex flex-col rounded-lg p-4 sm:p-5 lg:h-[448px]">
      <h3 className="mb-3 font-semibold text-slate-200">Balances</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BalanceVial
          symbol="SOL"
          variant="sol"
          note="Native Sol"
          token="SOL"
          amount={formatTokenBalance(DEMO_SOL, 9)}
          usd={fmtUsd(d.solVal)}
          fill={Math.min(d.solVal / 1000, 1)}
        />
        <BalanceVial
          symbol="USDC"
          variant="usdc"
          note="Stablecoin"
          token="USDC"
          amount={formatTokenBalance(DEMO_USDC, 6)}
          usd={fmtUsd(DEMO_USDC)}
          fill={DEMO_USDC / 1000}
        />
      </div>
      <div className="mt-3 min-h-0 flex-1">
        <BalanceTrend total={d.total} />
      </div>
    </div>
  )
}

function ActivityRow({
  title,
  when,
  amount,
  token,
  dir,
}: {
  title: string
  when: string
  amount: string
  token: TokenKey
  dir: "in" | "out"
}) {
  const inbound = dir === "in"
  const Icon = inbound ? ArrowDownLeft : ArrowUpRight
  const tone = inbound
    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/25"
    : "text-[#4B7F9B] bg-[#4B7F9B]/10 border-[#4B7F9B]/25"
  return (
    <li className="flex items-center gap-3 py-2">
      <span className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-md border ${tone}`} aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-200">{title}</div>
        <div className="text-[11px] text-slate-500">{when}</div>
      </div>
      <div
        className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${inbound ? "text-emerald-400" : "text-slate-200"}`}
      >
        <TokenLogo token={token} size={16} />
        {amount}
      </div>
    </li>
  )
}

function ActivityCard() {
  const tabs: [typeof History, boolean][] = [
    [History, true],
    [ArrowUpRight, false],
    [ArrowDownLeft, false],
    [ArrowDownUp, false],
    [Sparkles, false],
  ]
  return (
    <div className="wd-glass flex h-full flex-col rounded-lg p-4 sm:p-5 lg:min-h-[220px]">
      <div className="flex items-center justify-between gap-2 mb-3 min-h-[34px]">
        <h3 className="shrink-0 text-slate-200 font-semibold">Recent activity</h3>
        <div className="flex items-center gap-1" aria-hidden="true">
          {tabs.map(([Icon, active], i) => (
            <span
              key={i}
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                active
                  ? "border-[#4B7F9B]/45 bg-[#4B7F9B]/[0.1] text-[#4B7F9B]"
                  : "border-white/[0.06] text-slate-500"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
      </div>
      <div className="-mx-1 flex min-h-0 flex-1 flex-col overflow-hidden px-1">
        <ul className="divide-y divide-white/[0.04]">
          {DEMO_ACTIVITY.map((a) => (
            <ActivityRow key={a.title} title={a.title} when={a.when} amount={a.amount} token={a.token} dir={a.dir} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function SavingsTiles({ d }: { d: Demo }) {
  const goldFill = Math.min(1, DEMO_PAXG >= 1 ? 1 : DEMO_PAXG)
  const stakeFill = Math.min(1, d.stakeVal / d.paxgUsd)
  const gold = TOKEN_COLOR.PAXG
  const stake = TOKEN_COLOR.jitoSOL
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        className="flex items-center gap-3 rounded-lg border p-3"
        style={{ borderColor: `${gold}40`, background: `${gold}0d` }}
      >
        <div className="relative h-16 w-16 shrink-0">
          <LiquidCapsule variant="gold" shape="bar" fill={goldFill} width={64} height={64} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: gold }}>
              Save
            </span>
            <TokenLogo token="PAXG" size={22} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold tabular-nums text-slate-200">
              {formatTokenBalance(DEMO_PAXG, 6)}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: gold }}>
              oz
            </span>
            <span className="text-[10px] font-semibold text-slate-500">PAXG</span>
          </div>
          <div className="text-[11px] tabular-nums text-slate-400">{fmtUsd(d.goldVal)}</div>
          <span className="mt-1 block text-[10px] font-semibold text-slate-500">Gold held</span>
        </div>
      </div>
      <div
        className="relative flex items-center gap-3 rounded-lg border p-3"
        style={{ borderColor: `${stake}40`, background: `${stake}0d` }}
      >
        <div className="relative h-16 w-16 shrink-0">
          <LiquidCapsule variant="stake" shape="bar" fill={stakeFill} width={64} height={64} drip={DEMO_JITOSOL > 0} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: stake }}>
              Earn
            </span>
            <TokenLogo token="jitoSOL" size={22} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold tabular-nums text-slate-200">
              {formatTokenBalance(DEMO_JITOSOL, 9)}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: stake }}>
              jitoSOL
            </span>
          </div>
          <div className="text-[11px] tabular-nums text-slate-400">{fmtUsd(d.stakeVal)}</div>
          <span className="mt-1 block text-[10px] font-semibold text-slate-500">Staked SOL</span>
        </div>
        <span className="absolute bottom-2 right-2.5 text-[10px] font-semibold tabular-nums" style={{ color: stake }}>
          {fmtApy(d.apy)} APY
        </span>
      </div>
    </div>
  )
}

// Generic, greyed placeholder collectibles: wireframe tiles that keep the real
// gallery's liquid aspect-ratio layout with none of the original artwork.
const DEMO_COLLECTIBLES: { id: string; name: string; chip: "Collected" | "Minted"; w: number; h: number }[] = [
  { id: "1", name: "Untitled No.1", chip: "Minted", w: 900, h: 1200 },
  { id: "2", name: "Untitled No.2", chip: "Collected", w: 900, h: 1200 },
  { id: "3", name: "Untitled No.3", chip: "Minted", w: 900, h: 483 },
]

function CollectiblesCard() {
  const tabs: [string, typeof Wallet, boolean][] = [
    ["Collectibles", Gem, true],
    ["History", History, false],
    ["Buy", CreditCard, false],
    ["Backup", Lock, false],
  ]
  return (
    <div>
      <div className="wd-glass grid grid-cols-2 gap-1 rounded-lg p-1 sm:flex">
        {tabs.map(([label, Icon, active]) => (
          <span
            key={label}
            className={`sm:flex-1 inline-flex min-h-[44px] whitespace-nowrap items-center justify-center gap-1.5 rounded px-3.5 py-1.5 text-[13px] font-medium ${
              active
                ? "bg-[#4B7F9B]/12 text-[#4B7F9B] shadow-[inset_0_0_0_1px_rgb(75_127_155/0.4)]"
                : "text-slate-400"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <section className="wd-glass wd-aurora mt-4 flex min-h-[410px] flex-col rounded-lg p-4 sm:p-5">
        <h3 className="mb-3 font-semibold text-slate-200">Collectibles portfolio</h3>
        <div className="-mx-1 px-1">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            {DEMO_COLLECTIBLES.map((c) => (
              <div
                key={c.id}
                className={`group relative min-w-0 overflow-hidden rounded-md border border-white/[0.07] wd-wireframe ${
                  c.w > c.h ? "col-span-2 sm:col-auto" : ""
                }`}
                style={{ flexGrow: c.w / c.h, flexBasis: 0, aspectRatio: `${c.w} / ${c.h}` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gem className="h-8 w-8 text-slate-700" strokeWidth={1.2} aria-hidden="true" />
                </div>
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
                    c.chip === "Collected"
                      ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30"
                      : "bg-[#4B7F9B]/20 text-slate-200 ring-1 ring-[#4B7F9B]/45"
                  }`}
                >
                  {c.chip}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6">
                  <span className="block truncate text-[11px] font-semibold text-slate-300">{c.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// =========================================================
// SHOWCASE
// =========================================================

const wdStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const wdSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

export function WalletDemo() {
  const m = useWalletMarket()
  const d = demoFrom(
    m.solUsd ?? FALLBACK.solUsd,
    m.paxgUsd ?? FALLBACK.paxgUsd,
    m.jitoUsd ?? FALLBACK.jitoUsd,
    m.jitoApy,
  )
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={wdStagger}
      className="space-y-5"
    >
      <motion.div variants={wdSlideUp} className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-stretch">
        <ValueCard d={d} />
        <div className="flex flex-col gap-5">
          <PriceStrip d={d} />
          <SwapCard d={d} />
        </div>
      </motion.div>
      <motion.div variants={wdSlideUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-stretch">
        <BalancesCard d={d} />
        <div className="flex flex-col gap-5 lg:h-[448px]">
          <SavingsTiles d={d} />
          <div className="min-h-0 flex-1">
            <ActivityCard />
          </div>
        </div>
      </motion.div>
      <motion.div variants={wdSlideUp}>
        <CollectiblesCard />
      </motion.div>
      <motion.div variants={wdSlideUp} className="pt-2 text-center font-mono text-[11px] text-slate-600">
        Runs on Solana mainnet · live prices via Alchemy + Jupiter · demo holdings, inert controls
      </motion.div>
    </motion.div>
  )
}

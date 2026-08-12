"use client"

/**
 * The PRIZM landing page's parallax slice, ported directly from
 * ../prizm-trading/components/landing (rising-helix.tsx + parallax.tsx).
 *
 * One great helix of rising Solana token marks climbs the stage: each token
 * holds its station on the strand (uniform speed, evenly-spaced phases), swings
 * front-to-back as the strand turns, and bobs, sways and pulses like a bubble on
 * its way up. Every logo is rendered in the muted steel duotone this site uses
 * for protocol marks, so the field reads as one ambient system — never louder
 * than the interface over it. The whole stage drifts against the scroll.
 *
 * The marks are the real top-100 SPL tokens, their logos proxied same-origin so
 * the canvas can read the pixels for the duotone pass.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"

// =========================================================
// PARALLAX PRIMITIVES
// =========================================================

export function Parallax({
  children,
  speed = 40,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  return (
    <motion.div ref={ref} style={reduced ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  )
}

/** A parallaxing accent aurora behind a section. `tint` is an "r,g,b" string. */
export function SectionGlow({
  className,
  tint = "75,127,155",
  speed = 160,
}: {
  className?: string
  tint?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={reduced ? undefined : { y, opacity }}
      className={`pointer-events-none absolute -z-10 h-[520px] w-[760px] rounded-full blur-[110px] ${className ?? ""}`}
    >
      <div
        className="h-full w-full rounded-full"
        style={{ background: `radial-gradient(circle, rgba(${tint},0.22), transparent 70%)` }}
      />
    </motion.div>
  )
}

// =========================================================
// RISING HELIX
// =========================================================

interface TokenInfo {
  mint: string
  symbol: string
  logo: string
}

interface Mark {
  img: HTMLImageElement
  steel: HTMLCanvasElement | null // cached muted-duotone raster
}

// Steel duotone endpoints · shadow → highlight.
const DARK: [number, number, number] = [0x23, 0x36, 0x42]
const LIGHT: [number, number, number] = [0xa7, 0xc6, 0xd9]

function toSteelDuotone(img: HTMLImageElement): HTMLCanvasElement | null {
  const size = 96
  const c = document.createElement("canvas")
  c.width = size
  c.height = size
  const ctx = c.getContext("2d")
  if (!ctx) return null
  try {
    ctx.drawImage(img, 0, 0, size, size)
    const data = ctx.getImageData(0, 0, size, size)
    const px = data.data
    for (let i = 0; i < px.length; i += 4) {
      const a = px[i + 3]
      if (a === 0) continue
      // luminance → steel duotone
      const l = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255
      px[i] = DARK[0] + (LIGHT[0] - DARK[0]) * l
      px[i + 1] = DARK[1] + (LIGHT[1] - DARK[1]) * l
      px[i + 2] = DARK[2] + (LIGHT[2] - DARK[2]) * l
    }
    // A real protocol mark has transparent corners. A logo that is opaque
    // edge-to-edge is a square card, and in the field it reads as a grey box
    // floating over the copy rather than as a mark — leave those out.
    const corner = (x: number, y: number) => px[(y * size + x) * 4 + 3]
    const m = 3
    const opaqueCorners =
      corner(m, m) > 8 && corner(size - 1 - m, m) > 8 && corner(m, size - 1 - m) > 8 && corner(size - 1 - m, size - 1 - m) > 8
    if (opaqueCorners) return null
    ctx.putImageData(data, 0, 0)
    return c
  } catch {
    // Same-origin proxy means no taint, but never throw out of a paint path.
    return null
  }
}

function RisingHelix({ tokens }: { tokens: TokenInfo[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const marksRef = useRef<Mark[]>([])
  const pointer = useRef({ x: 0, tx: 0 })

  useEffect(() => {
    if (tokens.length === 0) return
    // 40 marks instead of the landing page's 100 — this is the condensed
    // slice, and the strand only ever holds ~22 at once anyway.
    const picks = tokens.slice(0, 40)
    const marks: Mark[] = picks.map((t) => {
      const mark: Mark = { img: new Image(), steel: null }
      mark.img.decoding = "async"
      mark.img.onload = () => {
        mark.steel = toSteelDuotone(mark.img)
      }
      mark.img.src = t.logo
      return mark
    })
    marksRef.current = marks
  }, [tokens])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let W = 0
    let H = 0
    let raf = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth - 0.5) * 2
    }
    window.addEventListener("pointermove", onMove, { passive: true })

    const TAU = Math.PI * 2
    const fract = (x: number) => x - Math.floor(x)
    const smoothstep = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
      return t * t * (3 - 2 * t)
    }

    let t = reduced ? 6 : 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduced) t += dt
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.04

      ctx.clearRect(0, 0, W, H)
      const pool = marksRef.current
      if (pool.length === 0) {
        raf = requestAnimationFrame(frame)
        return
      }
      const travel = H * 1.9 + 300
      // Sparse strand — on prizm.trading's viewport-tall stage that is ~22 marks
      // up at once. Travel scales with the stage height, so hold the marks-per-
      // pixel density instead of the count: a section-tall stage would otherwise
      // stretch the same 22 marks over twice the climb and read as empty. Each
      // slot still cycles through the whole pool, so nothing crowds.
      const STRAND = Math.min(pool.length, Math.max(18, Math.round(travel / 104)))

      const period = travel / 30
      const turns = 2.3
      const cx = W * 0.5 + pointer.current.x * 24
      const radius = Math.min(W * 0.38, 530)

      const entries: {
        raster: CanvasImageSource
        x: number
        y: number
        s: number
        a: number
        pulse: number
        depth: number
      }[] = []

      for (let slot = 0; slot < STRAND; slot++) {
        const raw = t / period + slot / STRAND
        const cyc = Math.floor(raw)
        const ph = raw - cyc
        // advance the token each time this slot completes a climb
        const idx = (((slot + cyc * STRAND) % pool.length) + pool.length) % pool.length
        const mark = pool[idx]
        // Only the duotone raster is ever drawn: the raw image would bring back
        // full brand colour and the square-card logos the pass filters out.
        const raster = mark.steel
        if (!raster) continue
        const fi = slot
        const y = H + 150 - ph * travel
        if (y < -260 || y > H + 260) continue
        const theta = ph * TAU * turns + t * 0.08 + fi * 0.13
        const depth = 0.5 + 0.5 * Math.sin(theta)
        const bob = Math.sin(t * (0.6 + fi * 0.05) + fi * 2.1) * 7
        const sway = Math.sin(t * (0.22 + fi * 0.017) + fi * 1.3) * 14
        const pulse = 0.5 + 0.5 * Math.sin(t * (0.5 + fi * 0.07) + fi * 1.7)
        const s = (58 + 36 * fract(fi * 0.777)) * (0.62 + 0.52 * depth) * (1 + 0.07 * pulse)
        const x = cx + Math.cos(theta) * radius + sway
        const vis = Math.min(1, Math.max(0, 1 - Math.abs(y - H * 0.5) / (H * 0.64)))
        const a = smoothstep(0, 0.35, vis) * (0.35 + 0.65 * depth)
        if (a <= 0.02) continue
        entries.push({ raster, x: x - s / 2, y: y + bob - s / 2, s, a, pulse, depth })
      }
      // Far side of the strand first, near side over it.
      entries.sort((p, q) => p.depth - q.depth)
      for (const e of entries) {
        // soft glow halo
        ctx.globalAlpha = e.a * (0.05 + 0.04 * e.pulse)
        ctx.drawImage(e.raster, e.x - e.s * 0.1, e.y - e.s * 0.1, e.s * 1.2, e.s * 1.2)
        // the mark
        ctx.globalAlpha = e.a * (0.2 + 0.12 * e.pulse)
        ctx.drawImage(e.raster, e.x, e.y, e.s, e.s)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

// =========================================================
// THE STAGE
// =========================================================

/**
 * The rising-token helix as a parallaxing backdrop for the PRIZM section. The
 * token list loads on approach — the marks are real logos, so there's no reason
 * to fetch a hundred of them before the section is anywhere near the viewport.
 */
export function PrizmParallax({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          ob.disconnect()
        }
      },
      { rootMargin: "900px" },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    if (!near) return
    let alive = true
    ;(async () => {
      try {
        const res = await fetch("/api/prizm?kind=tokens")
        if (!res.ok) return
        const j = (await res.json()) as { tokens?: TokenInfo[] }
        if (alive && j.tokens) setTokens(j.tokens.filter((t) => t.logo))
      } catch {
        /* the section reads fine without the field */
      }
    })()
    return () => {
      alive = false
    }
  }, [near])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* The field runs the full height of the section; the strand density above
          scales with it so the climb stays as populated as prizm.trading's. */}
      <Parallax speed={70} className="absolute inset-0">
        <div className="absolute inset-x-0 -top-[8%] h-[116%]">{near && <RisingHelix tokens={tokens} />}</div>
      </Parallax>
      {/* Feather the field into the page top and bottom so it never cuts hard. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #000102 0%, transparent 9%, transparent 91%, #000102 100%)",
        }}
      />
    </div>
  )
}

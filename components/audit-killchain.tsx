"use client"

/**
 * The kill-chain diagram from the engineering-manager deck (../prizm,
 * decks/fx_blocks.py · KILL_CHAIN), rendered here on a 2D canvas.
 *
 * Nine attacker personas fire in parallel against the same target. Each emits a
 * hypothesis bank; the survivors walk a ten-phase chain and are killed at every
 * gate that cannot make them reproduce. The narrowing is the point.
 *
 * The GDScript `paint(fx)` painter maps one-to-one onto the canvas primitives
 * below — same geometry, same timings, same survivor counts — so the animation
 * matches the slide frame for frame without shipping a second engine to a
 * portfolio page.
 */

import { useEffect, useRef, useState } from "react"

// Deck palette, in this site's accents.
const ACCENT: RGB = [0.29, 0.5, 0.61] // #4B7F9B
const ACCENT2: RGB = [0.42, 0.64, 0.75] // #6BA3BF
const INK: RGB = [0.886, 0.91, 0.941] // #e2e8f0
const MUTED: RGB = [0.58, 0.64, 0.72]
const OK: RGB = [0.35, 0.61, 0.51]
const KILL: RGB = [0.65, 0.45, 0.44]

type RGB = [number, number, number]
const css = (c: RGB, a: number) =>
  `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${Math.max(0, Math.min(1, a)).toFixed(3)})`

const NAMES = [
  "mempool-apex",
  "slot-wraith",
  "invariant-ghoul",
  "merkle-wraith",
  "domain-reaper",
  "opcode-oracle",
  "pragma-heretic",
  "curve-walker",
  "protocol-econ",
]
const PHASES = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P6.5", "P7", "P8"]
const TITLES = ["recon", "hypoth", "static", "symbol", "fuzz", "compose", "PoC", "fork gate", "defender", "refine"]
const SURVIVE = [41, 41, 33, 27, 22, 18, 12, 6, 4, 1]

/** The deck's deterministic hash — same seeds produce the same field. */
const rnd = (seed: number) => {
  const v = Math.sin(seed * 12.9898) * 43758.5453123
  return v - Math.floor(v)
}
const fmod = (a: number, b: number) => a - Math.floor(a / b) * b
const clampf = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

export function AuditKillChain({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [near, setNear] = useState(false)

  // Only run the loop while the diagram is actually on screen.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "200px" })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || !near) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let W = 1
    let H = 1
    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      W = Math.max(1, Math.round(rect.width))
      H = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // --- fx primitives, matching the deck's painter API -------------------
    const circle = (x: number, y: number, r: number, fill: string) => {
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()
    }
    const ring = (x: number, y: number, r: number, stroke: string, w: number) => {
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2)
      ctx.strokeStyle = stroke
      ctx.lineWidth = w
      ctx.stroke()
    }
    const rect = (x: number, y: number, w: number, h: number, color: string, filled = true, lw = 1) => {
      if (filled) {
        ctx.fillStyle = color
        ctx.fillRect(x, y, w, h)
      } else {
        ctx.strokeStyle = color
        ctx.lineWidth = lw
        ctx.strokeRect(x, y, w, h)
      }
    }
    const line = (x0: number, y0: number, x1: number, y1: number, color: string, w: number) => {
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.strokeStyle = color
      ctx.lineWidth = w
      ctx.stroke()
    }
    const mono = (x: number, y: number, text: string, size: number, color: string) => {
      ctx.font = `${size}px var(--font-mono), ui-monospace, monospace`
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
    }

    let raf = 0
    // A fixed t under reduced motion: the diagram still reads, it just holds.
    let t = reduced ? 4.2 : 0
    let last = performance.now()

    const paint = () => {
      ctx.clearRect(0, 0, W, H)
      // The deck block is ~1800×510; scale the vertical rhythm to the box.
      const sy = H / 510
      const L = 8
      const R = W - 8
      const lens_y = 44 * sy
      const bank_y = 150 * sy
      const spine_y = H - 96 * sy

      // --- the nine lenses ---------------------------------------------
      mono(L, 18 * sy, "9 ADVERSARY LENSES · RUN IN PARALLEL, EVERY BATCH", 12, css(MUTED, 0.6))
      const lane = (R - L) / 9
      for (let i = 0; i < 9; i++) {
        const cx = L + lane * (i + 0.5)
        const fire = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.72)
        ring(cx, lens_y, 13, css(ACCENT, 0.18 + 0.55 * fire), 1.5)
        circle(cx, lens_y, 3 + 2.5 * fire, css(ACCENT2, 0.35 + 0.6 * fire))
        mono(cx - NAMES[i].length * 3.3, lens_y + 34 * sy, NAMES[i], 11, css(MUTED, 0.45 + 0.4 * fire))
        // each lens pours into the shared bank
        for (let k = 0; k < 4; k++) {
          const prog = fmod(t * 0.5 + i * 0.11 + k * 0.25, 1)
          const px = cx + (W * 0.5 - cx) * prog * prog
          const py = lens_y + 50 * sy + prog * (bank_y - lens_y - 54 * sy)
          circle(px, py, 2, css(ACCENT2, 0.55 * (1 - prog * 0.7)))
        }
      }

      // --- the hypothesis bank -----------------------------------------
      const bw = Math.min(300, W * 0.42)
      rect(W * 0.5 - bw * 0.5, bank_y, bw, 40 * sy, css(ACCENT, 0.07))
      rect(W * 0.5 - bw * 0.5, bank_y, bw, 40 * sy, css(ACCENT, 0.3), false, 1)
      mono(W * 0.5 - 118, bank_y + 26 * sy, "HYPOTHESIS BANK · 41 OPEN", 13, css(INK, 0.85))

      // --- the funnel: hypotheses fall, most die on the way ------------
      const span = spine_y - 46 * sy - (bank_y + 40 * sy)
      for (let i = 0; i < 26; i++) {
        const sd = i * 19.7
        const drop = fmod(t * 0.36 + rnd(sd), 1)
        const dies = rnd(sd + 5)
        const x0 = W * 0.5 + (rnd(sd + 2) - 0.5) * bw * 0.9
        const x1 = L + 24 + rnd(sd + 9) * (R - L - 48)
        const px2 = x0 + (x1 - x0) * drop
        const py2 = bank_y + 44 * sy + drop * span
        const alive = drop < dies
        const col2 = alive ? ACCENT2 : KILL
        const a2 = alive ? 0.7 * (1 - drop * 0.4) : Math.max(0, 0.5 - (drop - dies) * 6)
        if (a2 > 0.01) {
          circle(px2, py2, 2.4, css(col2, a2))
          if (!alive && a2 > 0.2) ring(px2, py2, 5 + (drop - dies) * 40, css(KILL, a2 * 0.5), 1)
        }
      }

      // --- the ten-phase spine ------------------------------------------
      line(L, spine_y, R, spine_y, css(INK, 0.14), 1)
      const step = (R - L - 60) / 9
      for (let i = 0; i < 10; i++) {
        const px3 = L + 30 + step * i
        const wave = fmod(t * 0.34, 1.3)
        const here = clampf(1 - Math.abs(wave - i / 9) * 6, 0, 1)
        const gate = i === 7
        const col3 = gate ? KILL : ACCENT
        const bar = (10 + 26 * (SURVIVE[i] / 41)) * sy
        rect(px3 - 3, spine_y - bar, 6, bar, css(col3, 0.2 + 0.55 * here))
        circle(px3, spine_y, 3.5 + 3 * here, css(col3, 0.45 + 0.55 * here))
        if (here > 0.2) ring(px3, spine_y, 10 + 16 * (1 - here), css(col3, 0.5 * here), 1.5)
        mono(px3 - 10, spine_y - bar - 10 * sy, String(SURVIVE[i]), 12, css(col3, 0.45 + 0.55 * here))
        mono(px3 - PHASES[i].length * 3.6, spine_y + 24 * sy, PHASES[i], 12, css(INK, 0.4 + 0.55 * here))
        mono(px3 - TITLES[i].length * 2.9, spine_y + 42 * sy, TITLES[i], 10, css(MUTED, 0.35 + 0.45 * here))
      }

      mono(L, spine_y + 74 * sy, "41 HYPOTHESES IN", 12, css(MUTED, 0.65))
      const tail = "1 FINDING SHIPS"
      mono(R - tail.length * 7.4, spine_y + 74 * sy, tail, 12, css(OK, 0.85))
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduced) t += dt
      paint()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [near])

  return (
    <div
      ref={wrapRef}
      className={`glass-pane relative overflow-hidden rounded-lg ${className ?? ""}`}
      role="img"
      aria-label="Nine attacker personas emit a hypothesis bank; 41 hypotheses enter a ten-phase kill chain and one finding ships."
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

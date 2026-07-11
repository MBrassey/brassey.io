"use client"

import { useEffect, useRef } from "react"

type Wisp = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  age: number
  maxAge: number
  alpha: number
  seed: number
}

export default function Smoke({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Soft blobs; wisps are drawn stretched along their heading so strands
    // read as tendrils rather than dots. Warm sprite is the young flame
    // core, cool sprite is the smoke it decays into.
    const makeSprite = (stops: [number, string][]) => {
      const s = document.createElement("canvas")
      s.width = s.height = 64
      const c = s.getContext("2d")!
      const g = c.createRadialGradient(32, 32, 2, 32, 32, 32)
      for (const [o, col] of stops) g.addColorStop(o, col)
      c.fillStyle = g
      c.fillRect(0, 0, 64, 64)
      return s
    }
    const smokeSprite = makeSprite([
      [0, "rgba(216, 226, 234, 0.32)"],
      [0.4, "rgba(198, 210, 220, 0.12)"],
      [1, "rgba(198, 210, 220, 0)"],
    ])
    const fireSprite = makeSprite([
      [0, "rgba(255, 190, 110, 0.5)"],
      [0.35, "rgba(240, 120, 45, 0.2)"],
      [0.7, "rgba(180, 60, 20, 0.06)"],
      [1, "rgba(180, 60, 20, 0)"],
    ])

    let wisps: Wisp[] = []
    let w = 0
    let h = 0

    // Swirling flow field from layered sines — cheap curl-ish noise that
    // evolves over time so strands twist and never repeat
    const fieldAngle = (x: number, y: number, t: number, seed: number) => {
      return (
        Math.sin(x * 0.012 + t * 0.00022 + seed) * 1.6 +
        Math.cos(y * 0.014 - t * 0.00015 + seed * 1.7) * 1.4 +
        Math.sin((x + y) * 0.006 + t * 0.0001) * 1.2
      )
    }

    const spawn = (t: number, seedAnywhere: boolean): Wisp => {
      // three slowly wandering emitters, like embers below the frame
      const lane = Math.floor(Math.random() * 3)
      const ex =
        w * (0.2 + lane * 0.3) +
        Math.sin(t * 0.00006 + lane * 2.1) * w * 0.14 +
        (Math.random() - 0.5) * w * 0.1
      const maxAge = 5000 + Math.random() * 6000
      return {
        x: seedAnywhere ? Math.random() * w : ex,
        y: seedAnywhere ? Math.random() * h : h * (0.7 + Math.random() * 0.4),
        vx: 0,
        vy: 0,
        r: 4 + Math.random() * 9,
        age: seedAnywhere ? Math.random() * maxAge : 0,
        maxAge,
        alpha: 0.16 + Math.random() * 0.24,
        seed: Math.random() * Math.PI * 2,
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const COUNT = 130
    let rafId = 0
    let running = false
    let last = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(now - last || 16, 64)
      last = now

      if (wisps.length === 0) wisps = Array.from({ length: COUNT }, () => spawn(now, true))

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"

      for (let i = 0; i < wisps.length; i++) {
        let p = wisps[i]
        if (p.age >= p.maxAge || p.y < -30) p = wisps[i] = spawn(now, false)
        p.age += dt

        // steer along the field with upward buoyancy, eased so strands bend;
        // speed barely scales with size so grown wisps stay lazy
        const a = fieldAngle(p.x, p.y, now, p.seed)
        const speed = 0.0075 + Math.min(p.r, 14) * 0.0003
        const tvx = Math.cos(a) * speed
        const tvy = Math.sin(a) * speed * 0.6 - 0.008 // rise
        p.vx += (tvx - p.vx) * 0.04
        p.vy += (tvy - p.vy) * 0.04
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += 0.0012 * dt

        const t = p.age / p.maxAge
        const fade = t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.92
        const heading = Math.atan2(p.vy, p.vx)
        const stretch = 4.55 + Math.sin(p.seed + t * 6) * 1.4
        // young wisps burn warm near the base, then cool into grey smoke
        const heat = Math.pow(1 - t, 1.6)
        const flicker = 0.7 + 0.3 * Math.sin(now * 0.011 + p.seed * 7)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(heading)
        // long thin streak plus a trailing echo so strands taper like threads
        ctx.globalAlpha = fade * p.alpha * (1 - heat * 0.45)
        ctx.drawImage(smokeSprite, -p.r * stretch, -p.r * 0.8, p.r * 2 * stretch, p.r * 1.6)
        ctx.globalAlpha = fade * p.alpha * 0.5 * (1 - heat * 0.45)
        ctx.drawImage(smokeSprite, -p.r * stretch * 1.9, -p.r * 0.55, p.r * 2 * stretch, p.r * 1.1)
        if (heat > 0.03) {
          // tighter flickering ember core riding the head of the strand
          ctx.globalAlpha = Math.min(1, fade * p.alpha * heat * flicker * 2.8)
          ctx.drawImage(fireSprite, -p.r * 1.9, -p.r * 0.8, p.r * 3.8, p.r * 1.6)
        }
        ctx.restore()
      }

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    // Only burn frames while the card is actually on screen
    let onScreen = false
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = !!entries[0]?.isIntersecting
        if (onScreen && !document.hidden) start()
        else stop()
      },
      { rootMargin: "100px" },
    )
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (onScreen) start()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none mix-blend-screen ${className}`}
    />
  )
}

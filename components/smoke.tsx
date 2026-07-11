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

    // Soft round blobs only — no stretching or rotation, so drifting puffs
    // can never read as streaks. Glow sprite is the faint blue base light,
    // smoke sprite is the grey haze it cools into.
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
    const glowSprite = makeSprite([
      [0, "rgba(150, 200, 235, 0.4)"],
      [0.35, "rgba(96, 152, 190, 0.16)"],
      [0.7, "rgba(60, 110, 150, 0.05)"],
      [1, "rgba(60, 110, 150, 0)"],
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
        r: 14 + Math.random() * 26,
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

    const COUNT = 60
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
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
        // young wisps glow near the base, then cool into grey smoke;
        // breathe is a slow swell, deliberately far below flicker speed
        const heat = Math.pow(1 - t, 1.6)
        const breathe = 0.85 + 0.15 * Math.sin(now * 0.0009 + p.seed * 7)

        ctx.globalAlpha = fade * p.alpha * (1 - heat * 0.45)
        ctx.drawImage(smokeSprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
        if (heat > 0.03) {
          // soft cool-blue halo around the young puff
          ctx.globalAlpha = Math.min(1, fade * p.alpha * heat * breathe * 1.6)
          ctx.drawImage(glowSprite, p.x - p.r * 1.25, p.y - p.r * 1.25, p.r * 2.5, p.r * 2.5)
        }
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

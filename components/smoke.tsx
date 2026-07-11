"use client"

import { useEffect, useRef } from "react"

type Wisp = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  growth: number
  rot: number
  vr: number
  sway: number
  swaySpeed: number
  swayPhase: number
  age: number
  maxAge: number
  alpha: number
}

export default function Smoke({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Pre-render one soft blob; every wisp is this sprite scaled/rotated
    const sprite = document.createElement("canvas")
    sprite.width = sprite.height = 256
    const sctx = sprite.getContext("2d")!
    const grad = sctx.createRadialGradient(128, 128, 8, 128, 128, 128)
    grad.addColorStop(0, "rgba(214, 224, 232, 0.30)")
    grad.addColorStop(0.35, "rgba(196, 208, 218, 0.14)")
    grad.addColorStop(0.7, "rgba(180, 194, 206, 0.05)")
    grad.addColorStop(1, "rgba(180, 194, 206, 0)")
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 256, 256)

    let wisps: Wisp[] = []
    let w = 0
    let h = 0

    const spawn = (seedAnywhere: boolean): Wisp => {
      const maxAge = 9000 + Math.random() * 8000
      return {
        x: Math.random() * w,
        y: seedAnywhere ? Math.random() * h : h * (0.55 + Math.random() * 0.65),
        vx: (Math.random() - 0.5) * 0.006,
        vy: -(0.004 + Math.random() * 0.009),
        r: 30 + Math.random() * 70,
        growth: 0.0016 + Math.random() * 0.0028,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.00012,
        sway: 6 + Math.random() * 14,
        swaySpeed: 0.00008 + Math.random() * 0.00014,
        swayPhase: Math.random() * Math.PI * 2,
        age: seedAnywhere ? Math.random() * maxAge : 0,
        maxAge,
        alpha: 0.35 + Math.random() * 0.45,
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

    const COUNT = 16
    wisps = Array.from({ length: COUNT }, () => spawn(true))

    let rafId = 0
    let running = false
    let last = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(now - last || 16, 64)
      last = now

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"

      for (let i = 0; i < wisps.length; i++) {
        let p = wisps[i]
        p.age += dt
        if (p.age >= p.maxAge || p.y + p.r < -20) {
          p = wisps[i] = spawn(false)
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += p.growth * dt
        p.rot += p.vr * dt

        // fade in for the first quarter of life, out over the rest
        const t = p.age / p.maxAge
        const fade = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75
        const drift = Math.sin(now * p.swaySpeed + p.swayPhase) * p.sway

        ctx.globalAlpha = fade * p.alpha
        ctx.save()
        ctx.translate(p.x + drift, p.y)
        ctx.rotate(p.rot)
        ctx.drawImage(sprite, -p.r, -p.r, p.r * 2, p.r * 2)
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

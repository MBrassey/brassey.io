"use client"

import { useEffect, useRef } from "react"

type Node = { x: number; y: number; vx: number; vy: number; r: number }

export default function AvatarWeb({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    const nodes: Node[] = []
    const LINK = 80

    const init = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      nodes.length = 0
      const count = Math.max(14, Math.min(30, Math.floor(w / 11)))
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.012,
          vy: (Math.random() - 0.5) * 0.012,
          r: Math.random() * 1.4 + 0.6,
        })
      }
    }
    init()
    const ro = new ResizeObserver(init)
    ro.observe(canvas)

    let rafId = 0
    let running = false
    let last = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(now - last || 16, 64)
      last = now

      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        a.x += a.vx * dt
        a.y += a.vy * dt
        if (a.x < 0 || a.x > w) a.vx *= -1
        if (a.y < 0 || a.y > h) a.vy *= -1

        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(75, 127, 155, 0.5)"
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LINK) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(75, 127, 155, ${(1 - d / LINK) * 0.22})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
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

  // The radial mask hides the web over the face so it reads as sitting
  // behind the head, not on top of the photo
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none mix-blend-screen ${className}`}
      style={{
        maskImage: "radial-gradient(ellipse 46% 52% at 50% 40%, transparent 48%, black 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 46% 52% at 50% 40%, transparent 48%, black 80%)",
      }}
    />
  )
}

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
    const LINK = 135

    const init = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      nodes.length = 0
      const count = Math.max(7, Math.min(11, Math.floor(w / 30)))
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.012,
          vy: (Math.random() - 0.5) * 0.012,
          r: Math.random() * 1.8 + 1,
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
      for (const a of nodes) {
        a.x += a.vx * dt
        a.y += a.vy * dt
        if (a.x < 0 || a.x > w) a.vx *= -1
        if (a.y < 0 || a.y > h) a.vy *= -1

        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(75, 127, 155, 0.65)"
        ctx.fill()
      }

      // keep the web minimal: only the few closest pairs get a strand
      const pairs: { a: Node; b: Node; d: number }[] = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LINK) pairs.push({ a: nodes[i], b: nodes[j], d })
        }
      }
      pairs.sort((p, q) => p.d - q.d)
      for (const { a, b, d } of pairs.slice(0, 4)) {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(75, 127, 155, ${(1 - d / LINK) * 0.85})`
        ctx.lineWidth = 1.25
        ctx.stroke()
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

  // The subject cutout layered above occludes the web, so strands vanish
  // behind the head and body and re-emerge — no CSS mask needed
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  )
}

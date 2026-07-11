"use client"

import { useEffect } from "react"
import Lenis from "lenis"

declare global {
  interface Window {
    lenis?: Lenis
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.7,
      gestureOrientation: "vertical",
    })
    window.lenis = lenis

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute("href")!.slice(1)
      e.preventDefault()
      if (!id) {
        lenis.scrollTo(0, { force: true })
        return
      }
      const target = document.getElementById(id)
      // -64px offset mirrors the scroll-margin-top under the fixed header;
      // force lets nav links fire while a menu overlay still has Lenis stopped
      if (target) lenis.scrollTo(target, { offset: -64, force: true })
    }
    document.addEventListener("click", onAnchorClick)

    return () => {
      document.removeEventListener("click", onAnchorClick)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete window.lenis
    }
  }, [])

  return null
}

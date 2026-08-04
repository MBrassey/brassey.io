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
      // Defer past this click's React handlers: a menu overlay closing on the
      // same tap restores body scroll and restarts Lenis first, so the scroll
      // isn't swallowed while the page is still locked. -64px mirrors the
      // scroll-margin under the fixed header; force covers a stopped Lenis.
      window.setTimeout(() => {
        if (!id) {
          lenis.scrollTo(0, { force: true })
          return
        }
        const target = document.getElementById(id)
        if (target) lenis.scrollTo(target, { offset: -64, force: true })
      }, 60)
    }
    // Capture phase: claim hash-link clicks before Next's Link handler can
    // race a second (native) scroll against the Lenis animation.
    document.addEventListener("click", onAnchorClick, true)

    return () => {
      document.removeEventListener("click", onAnchorClick, true)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete window.lenis
    }
  }, [])

  return null
}

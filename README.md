# brassey.io

Personal site of Matt Brassey — blockchain infrastructure architect and Engineering Manager, Staking. A single-page operator console built with Next.js 16, React 19, and TypeScript.

Live at [brassey.io](https://brassey.io).

## Features

- **Live Canton telemetry** — the hero and Canton cards poll the public [ccscan.xyz](https://ccscan.xyz) chain API and project the transaction counter forward between polls, so the index height ticks in real time
- **⌘K command palette** — cmdk-powered navigation: jump to any section, open any project, copy the contact email
- **Streaming session backdrop** — the hero renders an animated Claude Code-style transcript of real fleet operations (validator upgrades, indexer maintenance, health checks)
- **Generated imagery** — Open Graph card, favicon, and apple icon are rendered at build time with `next/og`; no static image exports to maintain
- **Accessibility** — skip link, focus-visible styles, ARIA labels throughout, `prefers-reduced-motion` honored across canvas particles, streams, and CSS animation
- **Performance** — zero icon CDNs (inline SVG marks), lazy-mounted WakaTime chart, compressed imagery, preconnect hints

## Stack

- **Next.js 16** (App Router, static prerender) + **React 19** + **TypeScript**
- **Tailwind CSS** with shadcn/ui + Radix primitives
- **Framer Motion** for scroll-linked and in-view animation
- **cmdk** for the command palette
- **Lucide** icons, **JetBrains Mono** via `next/font`

## Structure

```
app/
├── layout.tsx           # Metadata, JSON-LD, viewport, fonts
├── page.tsx             # The entire console: data + sections + components
├── globals.css          # Tokens, ambient effects, reduced-motion rules
├── icon.tsx             # Generated favicon
├── apple-icon.tsx       # Generated apple touch icon
├── opengraph-image.tsx  # Generated OG/Twitter card
├── not-found.tsx        # Terminal-styled 404
├── robots.ts / sitemap.ts
components/ui/           # shadcn/ui primitives
public/                  # Photography, protocol logos
```

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static production build
```

## Deployment

Deployed on Vercel; pushes to `main` promote to production via the Git integration.

## Author

**Matt Brassey** — [GitHub](https://github.com/mbrassey) · [LinkedIn](https://www.linkedin.com/in/mbrassey/) · [matt@brassey.io](mailto:matt@brassey.io)

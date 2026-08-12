// Token-logo image proxy for the PRIZM helix.
//
// Same reason as the rest of /api/prizm: the browser only ever talks to this
// origin. It also means the helix canvas can read the pixels to build its
// steel-duotone raster without a cross-origin taint.

export const runtime = "nodejs"

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const UPSTREAM = "https://www.prizm.trading"

export async function GET(_req: Request, ctx: { params: Promise<{ mint: string }> }) {
  const { mint } = await ctx.params
  if (!MINT_RE.test(mint)) return new Response("bad mint", { status: 400 })
  try {
    // strict=1: the real icon or nothing — a generic monogram would put letter
    // circles in the helix instead of protocol marks.
    const res = await fetch(`${UPSTREAM}/api/logo/${mint}?strict=1`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return new Response("not found", { status: 404 })
    const type = res.headers.get("content-type") ?? "image/png"
    if (!type.startsWith("image/")) return new Response("not an image", { status: 415 })
    return new Response(res.body, {
      headers: {
        "content-type": type,
        // Logos are immutable per mint; let the browser and edge hold them.
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return new Response("upstream", { status: 502 })
  }
}

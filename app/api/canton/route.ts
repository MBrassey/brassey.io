// Server-side proxy for ccscan telemetry.
//
// The API key must never reach the browser, so the client calls this route and
// this route calls ccscan with the key attached. Runs on every request: ccscan
// sends `cache-control: public, max-age=15`, which would otherwise let both the
// CDN and the browser serve a stale head_seq instead of hitting the API.
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const key = process.env.CCSCAN_API_KEY
    const res = await fetch("https://ccscan.xyz/api/overview", {
      headers: key ? { "X-API-Key": key } : {},
      cache: "no-store",
    })
    if (!res.ok) {
      return Response.json({ error: "upstream" }, { status: 502 })
    }
    const j = await res.json()
    return Response.json(
      {
        head_seq: j.head_seq,
        latest_round: j.latest_round,
        party_count_est: j.party_count_est,
        tx_24h: j.tx_24h,
      },
      { headers: { "cache-control": "no-store, max-age=0" } },
    )
  } catch {
    return Response.json({ error: "unreachable" }, { status: 502 })
  }
}

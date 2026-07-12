// Server-side proxy for ccscan telemetry.
//
// The API key must never reach the browser, so the client calls this route and
// this route calls ccscan with the key attached. `no-store` on the upstream call
// matters: ccscan sends `cache-control: public, max-age=15`, which would
// otherwise let a cached response replay a stale head_seq instead of hitting the
// API.
export const dynamic = "force-dynamic"
export const revalidate = 0

// Every visitor polls this route, but they all share one API key with a 300
// req/min ceiling. Collapse concurrent traffic onto a single upstream call so
// visitor count can't exhaust the key's budget. The window is short enough that
// the head stays fresh — ccscan's own ingest cursor only advances every ~10s.
const UPSTREAM_TTL_MS = 4000
type Payload = { head_seq: number; latest_round: number; party_count_est: number; tx_24h: number }
let cached: { at: number; data: Payload } | null = null
let inflight: Promise<Payload | null> | null = null

async function fetchOverview(): Promise<Payload | null> {
  const key = process.env.CCSCAN_API_KEY
  const res = await fetch("https://ccscan.xyz/api/overview", {
    headers: key ? { "X-API-Key": key } : {},
    cache: "no-store",
  })
  if (!res.ok) return null
  const j = await res.json()
  if (typeof j.head_seq !== "number") return null
  return {
    head_seq: j.head_seq,
    latest_round: j.latest_round,
    party_count_est: j.party_count_est,
    tx_24h: j.tx_24h,
  }
}

export async function GET() {
  try {
    const now = Date.now()
    if (cached && now - cached.at < UPSTREAM_TTL_MS) {
      return Response.json(cached.data, { headers: { "cache-control": "no-store, max-age=0" } })
    }
    // Requests arriving together share one upstream call rather than stampeding
    if (!inflight) {
      inflight = fetchOverview().finally(() => {
        inflight = null
      })
    }
    const data = await inflight
    if (!data) {
      // Serve the last good value rather than blanking the counter on a blip
      if (cached) {
        return Response.json(cached.data, { headers: { "cache-control": "no-store, max-age=0" } })
      }
      return Response.json({ error: "upstream" }, { status: 502 })
    }
    cached = { at: Date.now(), data }
    return Response.json(data, { headers: { "cache-control": "no-store, max-age=0" } })
  } catch {
    if (cached) {
      return Response.json(cached.data, { headers: { "cache-control": "no-store, max-age=0" } })
    }
    return Response.json({ error: "unreachable" }, { status: 502 })
  }
}

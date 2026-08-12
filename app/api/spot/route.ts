// Live USD spot prices + 24h change for a set of Solana mints.
//
// Alchemy leads (its key stays server-side); Jupiter fills anything Alchemy
// misses and takes over when the quota is spent. 24h change comes from Jupiter's
// own field when present, else it is derived from Alchemy's historical series.
// Alchemy publishes no change field, so it is computed rather than trusted.
// See lib/market.ts for the shared cache and both legs.

import {
  MINT_RE,
  alchemySeries,
  alchemySpot,
  cached,
  change24hFrom,
  jupiterSpot,
  type Spot,
} from "@/lib/market"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_MINTS = 8
const TTL_MS = 20_000

type Payload = Record<string, Spot>

async function build(mints: string[]): Promise<Payload> {
  const [alch, jup] = await Promise.all([alchemySpot(mints), jupiterSpot(mints)])

  // Alchemy's historical leg is a call per mint, so only ask for the ones whose
  // change Jupiter could not supply and that Alchemy actually priced.
  const needChange = mints.filter((m) => jup[m]?.change24h == null && alch[m] != null)
  const derived = Object.fromEntries(
    await Promise.all(
      needChange.map(async (m) => {
        const series = await alchemySeries(m, "1h", 30)
        return [m, change24hFrom(series, alch[m])] as const
      }),
    ),
  ) as Record<string, number | null>

  const out: Payload = {}
  for (const m of mints) {
    out[m] = {
      usd: alch[m] ?? jup[m]?.usd ?? null,
      change24h: jup[m]?.change24h ?? derived[m] ?? null,
    }
  }
  return out
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("mints") ?? ""
  const mints = [...new Set(raw.split(",").map((m) => m.trim()).filter((m) => MINT_RE.test(m)))].slice(0, MAX_MINTS)
  if (mints.length === 0) return Response.json({ error: "no valid mints" }, { status: 400 })

  const body = await cached<Payload>(
    `spot:${mints.slice().sort().join(",")}`,
    TTL_MS,
    () => build(mints),
    (v) => Object.values(v).some((s) => s.usd != null),
  )
  if (!body) return Response.json({ error: "upstream" }, { status: 502 })
  return Response.json(body, { headers: { "cache-control": "no-store" } })
}

// Market feed for the wallet demo — keyed sources only.
//
// Alchemy's Prices API leads and Jupiter's keyed feed fills the gaps, both
// through lib/market so this surface can never disagree with the trading
// section. The jitoSOL APY is derived from keyed price history (the growth of
// the jitoSOL/SOL ratio, annualised) rather than read from a public stats feed.
//
// Nothing here is fabricated: a value that cannot be established is null, and
// the client renders a dash.

import { JITOSOL_MINT, SOL_MINT, alchemySpot, cached, jitoApyFromRatio, jupiterSpot } from "@/lib/market"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PAXG_MINT = "5GgRAEmv8ZxF2PR5hY72Qs5x1bnQ6UK2RbTPoqJ3wSwW"
const TTL_MS = 30_000

interface Payload {
  solUsd: number | null
  paxgUsd: number | null
  jitoUsd: number | null
  jitoApy: number | null
}

async function build(): Promise<Payload> {
  const mints = [SOL_MINT, PAXG_MINT, JITOSOL_MINT]
  const [alch, jup, apy] = await Promise.all([alchemySpot(mints), jupiterSpot(mints), jitoApyFromRatio()])
  const price = (m: string) => alch[m] ?? jup[m]?.usd ?? null
  return {
    solUsd: price(SOL_MINT),
    paxgUsd: price(PAXG_MINT),
    jitoUsd: price(JITOSOL_MINT),
    jitoApy: apy,
  }
}

export async function GET() {
  const body = await cached<Payload>(
    "wallet-market",
    TTL_MS,
    build,
    (v) => v.solUsd != null || v.paxgUsd != null,
  )
  return Response.json(body ?? { solUsd: null, paxgUsd: null, jitoUsd: null, jitoApy: null }, {
    headers: { "cache-control": "no-store" },
  })
}

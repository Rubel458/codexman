import { NextResponse } from "next/server"
import { getSearchResults } from "@/lib/cms"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") || "").slice(0, 80)
  const rate = await enforceRateLimit(`search:${clientFingerprint(request)}`, 60, 60)
  if (!rate.allowed) return NextResponse.json({ error: "Too many searches." }, { status: 429 })
  return NextResponse.json({ results: await getSearchResults(query) })
}

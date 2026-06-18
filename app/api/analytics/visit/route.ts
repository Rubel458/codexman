import { NextResponse } from "next/server"
import { z } from "zod"
import { enforceRateLimit } from "@/lib/rate-limit"
import { readJsonBody, sanitizeText } from "@/lib/security"
import { hashVisitorId, trackVisitor } from "@/lib/visitor-analytics"

const schema = z.object({
  visitorId: z.string().trim().min(16).max(160),
  path: z.string().trim().min(1).max(500),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await readJsonBody(request, 8 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 })
  const path = sanitizeText(parsed.data.path, 500)
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api") || path.includes("..")) {
    return NextResponse.json({ ok: true })
  }
  const key = hashVisitorId(parsed.data.visitorId).slice(0, 32)
  const rate = await enforceRateLimit(`analytics:${key}`, 240, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ ok: true })
  await trackVisitor({ visitorId: parsed.data.visitorId, path, userAgent: request.headers.get("user-agent") }).catch(() => undefined)
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}

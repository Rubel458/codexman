import { NextResponse } from "next/server"
import { z } from "zod"
import { authenticateAdmin, createSession } from "@/lib/auth"
import { isSameSiteBrowserRequest, verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { readJsonBody } from "@/lib/security"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const schema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(8).max(200) })

export async function POST(request: Request) {
  const hasValidCsrf = await verifyCsrf(request)
  if (!hasValidCsrf && !isSameSiteBrowserRequest(request)) {
    return NextResponse.json({ error: "Invalid security token." }, { status: 403, headers: { "Cache-Control": "no-store" } })
  }

  const fingerprint = clientFingerprint(request)
  const rate = await enforceRateLimit(`login:${fingerprint}`, 7, 15 * 60)
  if (!rate.allowed) {
    await logActivity({ request, action: "LOGIN_RATE_LIMITED", resource: "auth" })
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const parsed = schema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials." }, { status: 400, headers: { "Cache-Control": "no-store" } })

  const result = await authenticateAdmin(parsed.data.username, parsed.data.password)
  if (result.status === "locked") {
    await logActivity({ request, username: parsed.data.username, action: "LOGIN_LOCKED", resource: "auth", details: { lockedUntil: result.lockedUntil.toISOString() } })
    return NextResponse.json({ error: "Login temporarily locked after repeated failures. Try again in 10 minutes." }, { status: 423, headers: { "Cache-Control": "no-store" } })
  }
  if (result.status !== "ok") {
    await logActivity({ request, username: parsed.data.username, action: "LOGIN_FAILED", resource: "auth" })
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  await createSession(result.admin)
  await logActivity({ request, adminId: result.admin.id, username: result.admin.username, action: "LOGIN_SUCCESS", resource: "auth" })
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}

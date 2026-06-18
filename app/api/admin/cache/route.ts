import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { invalidateCmsCache } from "@/lib/cms-invalidation"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
  const invalidation = await invalidateCmsCache("manual-admin-clear")
  await logActivity({ request, adminId: session.sub, username: session.username, action: "CACHE_CLEARED", resource: "cache", details: invalidation })
  return NextResponse.json({ ok: true, invalidation })
}

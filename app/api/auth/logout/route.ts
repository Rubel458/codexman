import { NextResponse } from "next/server"
import { clearSession, getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"

export async function POST(request: Request) {
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token." }, { status: 403 })
  const session = await getSession()
  if (session) await logActivity({ request, adminId: session.sub, username: session.username, action: "LOGOUT", resource: "auth" })
  await clearSession()
  return NextResponse.json({ ok: true })
}

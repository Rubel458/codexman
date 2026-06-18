import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { sendLeadReply } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { idSchema, readJsonBody, sanitizeText } from "@/lib/security"

const schema = z.object({ subject: z.string().trim().min(3).max(180), message: z.string().trim().min(10).max(5000) })

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
  const rate = await enforceRateLimit(`lead-reply:${clientFingerprint(request)}`, 30, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Reply limit reached. Try again later." }, { status: 429 })
  const { id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 })
  const parsed = schema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter a subject and a message." }, { status: 400 })
  const lead = await prisma.contactLead.findUnique({ where: { id } })
  if (!lead?.email) return NextResponse.json({ error: "This lead does not have an email address." }, { status: 400 })
  try {
    const sent = await sendLeadReply(lead.email, sanitizeText(parsed.data.subject, 180), sanitizeText(parsed.data.message, 5000))
    if (!sent) return NextResponse.json({ error: "SMTP is not configured." }, { status: 503 })
    await prisma.contactLead.update({ where: { id }, data: { status: "IN_PROGRESS" } })
    await logActivity({ request, adminId: session.sub, username: session.username, action: "LEAD_REPLY_SENT", resource: "leads", resourceId: id, details: { email: lead.email, subject: parsed.data.subject } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[lead-reply] Email delivery failed", error)
    return NextResponse.json({ error: "Email delivery failed. Check SMTP settings." }, { status: 502 })
  }
}

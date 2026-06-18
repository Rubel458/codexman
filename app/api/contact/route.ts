import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { notifyNewLead } from "@/lib/email"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { readJsonBody, sanitizeText } from "@/lib/security"

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(5).max(60),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
})

export async function POST(request: Request) {
  const fingerprint = clientFingerprint(request)
  const rate = await enforceRateLimit(`contact:${fingerprint}`, 5, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 })
  const parsed = schema.safeParse(await readJsonBody(request, 20 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Please complete your name, email, phone number and project message." }, { status: 400 })
  if (parsed.data.website) return NextResponse.json({ ok: true })
  const lead = await prisma.contactLead.create({ data: {
    name: sanitizeText(parsed.data.name, 120),
    company: null,
    phone: sanitizeText(parsed.data.phone, 60),
    email: sanitizeText(parsed.data.email.toLowerCase(), 180),
    message: sanitizeText(parsed.data.message, 3000),
    ipHash: fingerprint,
    userAgent: request.headers.get("user-agent")?.slice(0, 500),
  } })
  await prisma.notification.create({ data: { type: "NEW_LEAD", title: `New enquiry from ${lead.name}`, message: lead.message.slice(0, 160), href: "/admin/leads" } }).catch(() => undefined)
  await notifyNewLead(lead).catch(() => undefined)
  return NextResponse.json({ ok: true }, { status: 201 })
}

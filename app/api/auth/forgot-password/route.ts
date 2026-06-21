import { createHash, randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyCsrf } from "@/lib/csrf"
import { sendPasswordReset } from "@/lib/email"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { readJsonBody } from "@/lib/security"
import { prisma } from "@/lib/prisma"
import { getSiteUrl } from "@/lib/site-url"

const schema = z.object({ email: z.string().email().max(160).transform(value => value.toLowerCase().trim()) })

export async function POST(request: Request) {
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token." }, { status: 403 })
  const rate = await enforceRateLimit(`forgot:${clientFingerprint(request)}`, 4, 30 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  const parsed = schema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: true })
  const admin = await prisma.admin.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" }, active: true } }).catch(() => null)
  if (admin?.email) {
    const token = randomBytes(32).toString("hex")
    await prisma.passwordResetToken.updateMany({ where: { adminId: admin.id, usedAt: null }, data: { usedAt: new Date() } })
    await prisma.passwordResetToken.create({ data: { tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 30 * 60 * 1000), adminId: admin.id } })
    const base = getSiteUrl()
    await sendPasswordReset(admin.email, `${base}/admin/reset-password?token=${token}`)
  }
  return NextResponse.json({ ok: true })
}

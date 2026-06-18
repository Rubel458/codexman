import { createHash } from "node:crypto"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyCsrf } from "@/lib/csrf"
import { prisma } from "@/lib/prisma"
import { readJsonBody } from "@/lib/security"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { logActivity } from "@/lib/activity-log"

const schema = z.object({ token: z.string().min(32), password: z.string().min(12).max(200) })

export async function POST(request: Request) {
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token." }, { status: 403 })
  const rate = await enforceRateLimit(`reset:${clientFingerprint(request)}`, 8, 30 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Too many reset attempts. Try again later." }, { status: 429 })
  const parsed = schema.safeParse(await readJsonBody(request, 16 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Use a password with at least 12 characters." }, { status: 400 })
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex")
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 })
  await prisma.$transaction([
    prisma.admin.update({ where: { id: reset.adminId }, data: { passwordHash: await hash(parsed.data.password, 12), sessionVersion: { increment: 1 }, failedLoginAttempts: 0, lockedUntil: null } }),
    prisma.passwordResetToken.updateMany({ where: { adminId: reset.adminId, usedAt: null }, data: { usedAt: new Date() } }),
  ])
  await logActivity({ request, adminId: reset.adminId, action: "PASSWORD_RESET", resource: "auth" })
  return NextResponse.json({ ok: true })
}

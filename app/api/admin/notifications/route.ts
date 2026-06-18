import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { prisma } from "@/lib/prisma"
import { readJsonBody } from "@/lib/security"

const actionSchema = z.object({ id: z.string().min(1).max(160).optional(), markAllRead: z.boolean().optional() }).refine(value => value.id || value.markAllRead, "Choose a notification action")

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const [unread, items] = await Promise.all([
    prisma.notification.count({ where: { read: false } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ])
  return NextResponse.json({ unread, items }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
  const parsed = actionSchema.safeParse(await readJsonBody(request).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification action" }, { status: 400 })
  if (parsed.data.markAllRead) await prisma.notification.updateMany({ where: { read: false }, data: { read: true } })
  else if (parsed.data.id) await prisma.notification.update({ where: { id: parsed.data.id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}

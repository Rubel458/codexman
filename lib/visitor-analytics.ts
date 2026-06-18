import { createHash } from "node:crypto"
import { prisma } from "@/lib/prisma"

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function hashVisitorId(visitorId: string) {
  const pepper = process.env.ANALYTICS_HASH_SECRET || process.env.SESSION_SECRET || "development-only-analytics-secret"
  return createHash("sha256").update(`${pepper}:${visitorId}`).digest("hex")
}

export async function trackVisitor(input: { visitorId: string; path: string; userAgent?: string | null }) {
  const visitorHash = hashVisitorId(input.visitorId)
  const dateKey = utcDateKey()
  return prisma.visitorDaily.upsert({
    where: { dateKey_visitorHash: { dateKey, visitorHash } },
    create: {
      dateKey,
      visitorHash,
      pageViews: 1,
      firstPath: input.path,
      lastPath: input.path,
      userAgent: input.userAgent?.slice(0, 500) || null,
    },
    update: {
      pageViews: { increment: 1 },
      lastPath: input.path,
      userAgent: input.userAgent?.slice(0, 500) || null,
    },
  })
}

export function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function startOfUtcWeek(date = new Date()) {
  const start = startOfUtcDay(date)
  const day = start.getUTCDay() || 7
  start.setUTCDate(start.getUTCDate() - day + 1)
  return start
}

export function startOfUtcMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export function startOfUtcYear(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
}

export async function uniqueVisitorsSince(from: Date) {
  const rows = await prisma.visitorDaily.findMany({
    where: { createdAt: { gte: from } },
    distinct: ["visitorHash"],
    select: { visitorHash: true },
  })
  return rows.length
}

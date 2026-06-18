import { NextResponse } from "next/server"
import { normalizeBcryptHash } from "@/lib/admin-password"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export async function GET() {
  let database = false; let error: string | null = null
  try { await prisma.$queryRaw`SELECT 1`; database = true } catch (cause) { error = cause instanceof Error ? cause.message : "Database unavailable" }
  const detailed = process.env.NODE_ENV !== "production" || !!await getSession()
  if (!detailed) return NextResponse.json({ ok: database }, { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } })
  const hashConfigured = !!normalizeBcryptHash(process.env.ADMIN_PASSWORD_HASH)
  const localPasswordConfigured = process.env.NODE_ENV !== "production" && !!process.env.ADMIN_PASSWORD
  return NextResponse.json({ ok: database, database, adminUsernameConfigured: !!process.env.ADMIN_USERNAME, adminPasswordConfigured: hashConfigured || localPasswordConfigured, adminPasswordMode: hashConfigured ? "bcrypt" : localPasswordConfigured ? "local-plain" : "missing", sessionSecretConfigured: !!process.env.SESSION_SECRET, redisConfigured: !!process.env.REDIS_URL, error }, { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } })
}

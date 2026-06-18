import { NextResponse } from "next/server"
import { z } from "zod"
import { createDatabaseBackup, backupSummary } from "@/lib/backup"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { prisma } from "@/lib/prisma"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { readJsonBody } from "@/lib/security"

const schema = z.object({ type: z.enum(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]).default("MANUAL") })

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const summary = await backupSummary()
  const rows = await prisma.$queryRaw<Array<{ size: bigint }>>`SELECT pg_database_size(current_database()) AS size`
  return NextResponse.json({ ...summary, databaseSizeBytes: Number(rows[0]?.size || 0), allowRestore: process.env.ALLOW_ADMIN_RESTORE === "true" }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
  const rate = await enforceRateLimit(`backup-create:${clientFingerprint(request)}`, 6, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Backup creation limit reached. Try again later." }, { status: 429 })
  const parsed = schema.safeParse(await readJsonBody(request, 8 * 1024).catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: "Invalid backup type" }, { status: 400 })
  try {
    const backup = await createDatabaseBackup(parsed.data.type, session.sub)
    await logActivity({ request, adminId: session.sub, username: session.username, action: "BACKUP_CREATED", resource: "backups", resourceId: backup.id, details: { filename: backup.filename, type: backup.type, sizeBytes: backup.sizeBytes } })
    return NextResponse.json({ backup }, { status: 201 })
  } catch (error) {
    console.error("[backup] create failed", error)
    return NextResponse.json({ error: "Backup failed. Verify that pg_dump is installed and DATABASE_URL is valid." }, { status: 500 })
  }
}

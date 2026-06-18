import { NextResponse } from "next/server"
import { z } from "zod"
import { deleteDatabaseBackup, restoreDatabaseBackup } from "@/lib/backup"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { idSchema, readJsonBody } from "@/lib/security"

const restoreSchema = z.object({ action: z.literal("restore"), confirmation: z.literal("RESTORE") })

async function authorize(request: Request) {
  const session = await getSession()
  if (!session) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (!await verifyCsrf(request)) return { response: NextResponse.json({ error: "Invalid security token" }, { status: 403 }) }
  const rate = await enforceRateLimit(`backup-write:${clientFingerprint(request)}`, 12, 60 * 60)
  if (!rate.allowed) return { response: NextResponse.json({ error: "Too many backup operations. Try again later." }, { status: 429 }) }
  return { session }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.response) return auth.response
  const { id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid backup ID" }, { status: 400 })
  try {
    await deleteDatabaseBackup(id)
    await logActivity({ request, adminId: auth.session!.sub, username: auth.session!.username, action: "BACKUP_DELETED", resource: "backups", resourceId: id })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: "Backup not found" }, { status: 404 }) }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.response) return auth.response
  if (process.env.ALLOW_ADMIN_RESTORE !== "true") return NextResponse.json({ error: "Admin restore is disabled. Enable ALLOW_ADMIN_RESTORE only during a maintenance window." }, { status: 403 })
  const { id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid backup ID" }, { status: 400 })
  const parsed = restoreSchema.safeParse(await readJsonBody(request, 8 * 1024).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Type RESTORE to confirm this destructive operation." }, { status: 400 })
  try {
    const backup = await restoreDatabaseBackup(id)
    await logActivity({ request, adminId: auth.session!.sub, username: auth.session!.username, action: "BACKUP_RESTORED", resource: "backups", resourceId: id, details: { filename: backup.filename } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[backup] restore failed", error)
    return NextResponse.json({ error: "Restore failed. Run restoration from the VPS shell during maintenance if the database is busy." }, { status: 500 })
  }
}

import { readFile } from "node:fs/promises"
import { NextResponse } from "next/server"
import { getBackupDownloadPath } from "@/lib/backup"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-log"
import { idSchema } from "@/lib/security"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid backup ID" }, { status: 400 })
  try {
    const { record, filepath } = await getBackupDownloadPath(id)
    const body = await readFile(filepath)
    await logActivity({ request, adminId: session.sub, username: session.username, action: "BACKUP_DOWNLOADED", resource: "backups", resourceId: id, details: { filename: record.filename } })
    return new NextResponse(body, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${record.filename}"`, "Cache-Control": "no-store" } })
  } catch { return NextResponse.json({ error: "Backup not found" }, { status: 404 }) }
}

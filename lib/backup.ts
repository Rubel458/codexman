import { execFile } from "node:child_process"
import { randomUUID } from "node:crypto"
import { mkdir, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"
import type { BackupType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const execFileAsync = promisify(execFile)
const retention: Record<BackupType, number> = { MANUAL: 50, DAILY: 7, WEEKLY: 4, MONTHLY: 3 }

function backupRoot() { const fallback = path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "backups"); return process.env.BACKUP_DIR ? path.resolve(/* turbopackIgnore: true */ process.env.BACKUP_DIR) : fallback }
function safeFilename(value: string) { if (!/^[a-zA-Z0-9_.-]+\.dump$/.test(value)) throw new Error("INVALID_BACKUP_FILENAME"); return value }
function stamp(date = new Date()) { return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z") }
function pgDumpBinary() { return process.env.PG_DUMP_PATH || "pg_dump" }
function pgRestoreBinary() { return process.env.PG_RESTORE_PATH || "pg_restore" }
function databaseUrl() { const value = process.env.DATABASE_URL; if (!value) throw new Error("DATABASE_URL is required"); return value }
function escapePgPass(value: string) { return value.replace(/\\/g, "\\\\").replace(/:/g, "\\:") }
function connection() {
  const url = new URL(databaseUrl())
  if (!["postgresql:", "postgres:"].includes(url.protocol)) throw new Error("DATABASE_URL must use PostgreSQL")
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""))
  if (!database || !url.hostname || !url.username) throw new Error("DATABASE_URL is incomplete")
  return { host: url.hostname, port: url.port || "5432", database, username: decodeURIComponent(url.username), password: decodeURIComponent(url.password), sslmode: url.searchParams.get("sslmode") || undefined }
}
async function withPgPass<T>(run: (options: { args: string[]; env: NodeJS.ProcessEnv }) => Promise<T>) {
  const root = backupRoot(); await mkdir(root, { recursive: true })
  const db = connection(); const pgpass = path.join(root, `.pgpass-${randomUUID()}`)
  await writeFile(pgpass, `${escapePgPass(db.host)}:${escapePgPass(db.port)}:${escapePgPass(db.database)}:${escapePgPass(db.username)}:${escapePgPass(db.password)}\n`, { mode: 0o600 })
  const env = { ...process.env, PGPASSFILE: pgpass, ...(db.sslmode ? { PGSSLMODE: db.sslmode } : {}) }
  const args = ["--host", db.host, "--port", db.port, "--username", db.username, "--dbname", db.database]
  try { return await run({ args, env }) } finally { await rm(pgpass, { force: true }).catch(() => undefined) }
}

export async function createDatabaseBackup(type: BackupType = "MANUAL", createdByAdminId?: string | null) {
  const root = backupRoot(); await mkdir(root, { recursive: true })
  const filename = safeFilename(`itlabbd-${type.toLowerCase()}-${stamp()}.dump`)
  const filepath = path.join(/* turbopackIgnore: true */ root, filename)
  try {
    await withPgPass(({ args, env }) => execFileAsync(pgDumpBinary(), ["--format=custom", "--no-owner", "--no-privileges", "--file", filepath, ...args], { env, timeout: 10 * 60 * 1000, maxBuffer: 1024 * 1024 }))
    const file = await stat(filepath)
    const record = await prisma.databaseBackup.create({ data: { filename, type, sizeBytes: Number(file.size), status: "READY", createdByAdminId: createdByAdminId && createdByAdminId !== "env-admin" ? createdByAdminId : null } })
    await pruneBackups(type); return record
  } catch (error) {
    await rm(filepath, { force: true }).catch(() => undefined)
    await prisma.databaseBackup.create({ data: { filename, type, status: "FAILED", note: error instanceof Error ? error.message.slice(0, 500) : "Backup failed", createdByAdminId: createdByAdminId && createdByAdminId !== "env-admin" ? createdByAdminId : null } }).catch(() => undefined)
    throw error
  }
}
export async function pruneBackups(type: BackupType) { const stale = await prisma.databaseBackup.findMany({ where: { type, status: "READY" }, orderBy: { createdAt: "desc" }, skip: retention[type] }); for (const item of stale) await deleteDatabaseBackup(item.id) }
export async function deleteDatabaseBackup(id: string) { const record = await prisma.databaseBackup.findUnique({ where: { id } }); if (!record) throw new Error("BACKUP_NOT_FOUND"); await rm(path.join(/* turbopackIgnore: true */ backupRoot(), safeFilename(record.filename)), { force: true }); await prisma.databaseBackup.delete({ where: { id } }) }
export async function restoreDatabaseBackup(id: string) { const record = await prisma.databaseBackup.findUnique({ where: { id } }); if (!record || record.status !== "READY") throw new Error("BACKUP_NOT_FOUND"); const filepath = path.join(/* turbopackIgnore: true */ backupRoot(), safeFilename(record.filename)); await stat(filepath); await withPgPass(({ args, env }) => execFileAsync(pgRestoreBinary(), ["--clean", "--if-exists", "--no-owner", "--no-privileges", ...args, filepath], { env, timeout: 15 * 60 * 1000, maxBuffer: 4 * 1024 * 1024 })); return record }
export async function getBackupDownloadPath(id: string) { const record = await prisma.databaseBackup.findUnique({ where: { id } }); if (!record || record.status !== "READY") throw new Error("BACKUP_NOT_FOUND"); const filepath = path.join(/* turbopackIgnore: true */ backupRoot(), safeFilename(record.filename)); await stat(filepath); return { record, filepath } }
export async function backupSummary() { const [items, total] = await Promise.all([prisma.databaseBackup.findMany({ orderBy: { createdAt: "desc" }, take: 100 }), prisma.databaseBackup.aggregate({ _sum: { sizeBytes: true }, _count: { _all: true } })]); return { items, totalBackups: total._count._all, totalSizeBytes: total._sum.sizeBytes || 0, lastBackup: items.find((item: { status: string }) => item.status === "READY") || null } }

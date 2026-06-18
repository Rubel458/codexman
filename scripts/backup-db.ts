import "dotenv/config"
import type { BackupType } from "@prisma/client"
import { createDatabaseBackup } from "../lib/backup"
import { prisma } from "../lib/prisma"
const requested = String(process.argv[2] || "DAILY").toUpperCase()
const type = (["MANUAL", "DAILY", "WEEKLY", "MONTHLY"].includes(requested) ? requested : "DAILY") as BackupType
createDatabaseBackup(type).then(backup => console.log(`Backup completed: ${backup.filename}`)).catch(error => { console.error("Backup failed", error); process.exitCode = 1 }).finally(() => prisma.$disconnect())

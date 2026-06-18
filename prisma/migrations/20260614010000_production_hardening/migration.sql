-- V10 production hardening: account locks, activity logs, backup inventory and optimized media metadata.
CREATE TYPE "BackupType" AS ENUM ('MANUAL', 'DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE "BackupStatus" AS ENUM ('READY', 'FAILED');

ALTER TABLE "Admin"
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);

ALTER TABLE "Media"
  ADD COLUMN "originalUrl" TEXT,
  ADD COLUMN "optimizedUrl" TEXT,
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER;

CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resourceId" TEXT,
  "username" TEXT,
  "details" JSONB,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "adminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatabaseBackup" (
  "id" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "type" "BackupType" NOT NULL DEFAULT 'MANUAL',
  "status" "BackupStatus" NOT NULL DEFAULT 'READY',
  "sizeBytes" INTEGER NOT NULL DEFAULT 0,
  "note" TEXT,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DatabaseBackup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DatabaseBackup_filename_key" ON "DatabaseBackup"("filename");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt");
CREATE INDEX "ActivityLog_resource_createdAt_idx" ON "ActivityLog"("resource", "createdAt");
CREATE INDEX "DatabaseBackup_type_createdAt_idx" ON "DatabaseBackup"("type", "createdAt");
CREATE INDEX "DatabaseBackup_createdAt_idx" ON "DatabaseBackup"("createdAt");

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DatabaseBackup" ADD CONSTRAINT "DatabaseBackup_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

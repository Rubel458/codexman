import path from "node:path"
import { rm } from "node:fs/promises"
import { prisma } from "@/lib/prisma"

export const downloadFilenamePattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,180}\.(?:zip|pdf|txt|csv|json|png|jpe?g|webp)$/i

export function downloadRoot() {
  return process.env.DOWNLOAD_DIR
    ? path.resolve(process.env.DOWNLOAD_DIR)
    : path.join(process.cwd(), "storage", "downloads")
}

export function safeDownloadFilename(filename: string) {
  if (!downloadFilenamePattern.test(filename)) throw new Error("INVALID_DOWNLOAD_FILENAME")
  return filename
}

export function downloadFilePath(filename: string) {
  return path.join(downloadRoot(), safeDownloadFilename(filename))
}

export async function deleteDownloadItemWithFile(id: string) {
  const item = await prisma.downloadItem.findUnique({ where: { id } })
  if (!item) throw new Error("DOWNLOAD_NOT_FOUND")
  await rm(downloadFilePath(item.fileName), { force: true }).catch(() => undefined)
  await prisma.downloadItem.delete({ where: { id } })
  return item
}

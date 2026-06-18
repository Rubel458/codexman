import { rm } from "node:fs/promises"
import { prisma } from "@/lib/prisma"
import { filenameFromUploadUrl, uploadFilePath } from "@/lib/upload-storage"

export async function deleteMediaWithFiles(id: string) {
  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) throw new Error("MEDIA_NOT_FOUND")
  const filenames = new Set<string>()
  for (const value of [media.filename, filenameFromUploadUrl(media.url), filenameFromUploadUrl(media.originalUrl), filenameFromUploadUrl(media.optimizedUrl)]) {
    if (typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,180}\.(?:webp|png|jpe?g)$/i.test(value)) filenames.add(value)
  }
  for (const filename of filenames) await rm(uploadFilePath(filename), { force: true }).catch(() => undefined)
  await prisma.media.delete({ where: { id } })
  return media
}

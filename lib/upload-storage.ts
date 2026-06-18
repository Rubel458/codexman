import path from "node:path"

export const uploadFilenamePattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,180}\.(?:webp|png|jpe?g)$/i

export function uploadRoot() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads")
}

export function safeUploadFilename(filename: string) {
  if (!uploadFilenamePattern.test(filename)) throw new Error("INVALID_UPLOAD_FILENAME")
  return filename
}

export function uploadFilePath(filename: string) {
  return path.join(uploadRoot(), safeUploadFilename(filename))
}

export function filenameFromUploadUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/uploads/")) return null
  const filename = value.slice("/uploads/".length)
  return uploadFilenamePattern.test(filename) ? filename : null
}

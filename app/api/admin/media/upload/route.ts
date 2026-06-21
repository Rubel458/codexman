import { randomUUID } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import sharp from "sharp"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { prisma } from "@/lib/prisma"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { sanitizeText } from "@/lib/security"
import { uploadFilePath, uploadRoot } from "@/lib/upload-storage"

sharp.cache(false)
sharp.concurrency(1)

const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]])
const defaultMaxImageBytes = 10 * 1024 * 1024
const defaultMaxInputPixels = 36_000_000
const defaultUploadLimitPerHour = 250

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
function isJpeg(buffer: Buffer) { return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }
function isPng(buffer: Buffer) { return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])) }
function isWebp(buffer: Buffer) { return buffer.length > 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP" }
function validateImage(type: string, buffer: Buffer) {
  if (type === "image/jpeg" && isJpeg(buffer)) return buffer
  if (type === "image/png" && isPng(buffer)) return buffer
  if (type === "image/webp" && isWebp(buffer)) return buffer
  throw new Error("INVALID_IMAGE")
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })

  const uploadLimit = positiveNumber(process.env.ADMIN_UPLOAD_LIMIT_PER_HOUR, defaultUploadLimitPerHour)
  const rate = await enforceRateLimit(`admin-upload:${session.sub}:${clientFingerprint(request)}`, uploadLimit, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 })

  const maxImageBytes = positiveNumber(process.env.MAX_IMAGE_UPLOAD_BYTES, defaultMaxImageBytes)
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength && contentLength > maxImageBytes + 1024 * 1024) {
    return NextResponse.json({ error: `Maximum image size is ${Math.round(maxImageBytes / 1024 / 1024)} MB.` }, { status: 413 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Select an image." }, { status: 400 })
  const extension = allowed.get(file.type)
  if (!extension) return NextResponse.json({ error: "Only JPG, JPEG, PNG and WebP images are allowed. SVG uploads are disabled for security." }, { status: 400 })
  if (file.size > maxImageBytes) return NextResponse.json({ error: `Maximum image size is ${Math.round(maxImageBytes / 1024 / 1024)} MB.` }, { status: 400 })

  const uploads = uploadRoot()
  await mkdir(uploads, { recursive: true })
  const base = randomUUID()
  const originalFilename = `${base}-original${extension}`
  const optimizedFilename = `${base}.webp`
  const originalPath = uploadFilePath(originalFilename)
  const optimizedPath = uploadFilePath(optimizedFilename)
  try {
    const buffer = validateImage(file.type, Buffer.from(await file.arrayBuffer()))
    const maxInputPixels = positiveNumber(process.env.MAX_IMAGE_INPUT_PIXELS, defaultMaxInputPixels)
    const image = sharp(buffer, { limitInputPixels: maxInputPixels, sequentialRead: true })
    const metadata = await image.metadata()
    if (!metadata.width || !metadata.height) throw new Error("INVALID_IMAGE_DIMENSIONS")
    if (metadata.width * metadata.height > maxInputPixels) throw new Error("IMAGE_TOO_LARGE")

    await writeFile(originalPath, buffer, { flag: "wx" })
    const optimized = await image
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true })
    await writeFile(optimizedPath, optimized.data, { flag: "wx" })
    const originalUrl = `/uploads/${originalFilename}`
    const optimizedUrl = `/uploads/${optimizedFilename}`
    const media = await prisma.media.create({ data: { filename: optimizedFilename, url: optimizedUrl, originalUrl, optimizedUrl, mimeType: "image/webp", sizeBytes: optimized.data.length, width: optimized.info.width, height: optimized.info.height, altText: sanitizeText(String(form.get("altText") || ""), 240) || null } })
    await logActivity({ request, adminId: session.sub, username: session.username, action: "MEDIA_UPLOADED", resource: "media", resourceId: media.id, details: { filename: media.filename, originalUrl, optimizedUrl, sizeBytes: media.sizeBytes } })
    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    await Promise.all([rm(originalPath, { force: true }), rm(optimizedPath, { force: true })])
    console.error("[upload] Image processing failed", error)
    return NextResponse.json({ error: "The image is invalid, too large, or could not be optimized safely." }, { status: 400 })
  }
}

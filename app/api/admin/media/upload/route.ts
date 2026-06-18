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

const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]])
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
  const rate = await enforceRateLimit(`admin-upload:${clientFingerprint(request)}`, 40, 60 * 60)
  if (!rate.allowed) return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 })
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Select an image." }, { status: 400 })
  const extension = allowed.get(file.type)
  if (!extension) return NextResponse.json({ error: "Only JPG, JPEG, PNG and WebP images are allowed. SVG uploads are disabled for security." }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Maximum image size is 5 MB." }, { status: 400 })
  const uploads = uploadRoot()
  await mkdir(uploads, { recursive: true })
  const base = randomUUID()
  const originalFilename = `${base}-original${extension}`
  const optimizedFilename = `${base}.webp`
  const originalPath = uploadFilePath(originalFilename)
  const optimizedPath = uploadFilePath(optimizedFilename)
  try {
    const buffer = validateImage(file.type, Buffer.from(await file.arrayBuffer()))
    await writeFile(originalPath, buffer, { flag: "wx" })
    const optimized = await sharp(buffer).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true })
    await writeFile(optimizedPath, optimized.data, { flag: "wx" })
    const originalUrl = `/uploads/${originalFilename}`
    const optimizedUrl = `/uploads/${optimizedFilename}`
    const media = await prisma.media.create({ data: { filename: optimizedFilename, url: optimizedUrl, originalUrl, optimizedUrl, mimeType: "image/webp", sizeBytes: optimized.data.length, width: optimized.info.width, height: optimized.info.height, altText: sanitizeText(String(form.get("altText") || ""), 240) || null } })
    await logActivity({ request, adminId: session.sub, username: session.username, action: "MEDIA_UPLOADED", resource: "media", resourceId: media.id, details: { filename: media.filename, originalUrl, optimizedUrl, sizeBytes: media.sizeBytes } })
    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    await Promise.all([rm(originalPath, { force: true }), rm(optimizedPath, { force: true })])
    console.error("[upload] Image processing failed", error)
    return NextResponse.json({ error: "The image is invalid or could not be optimized." }, { status: 400 })
  }
}

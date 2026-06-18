import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { uploadFilePath } from "@/lib/upload-storage"

const mime = new Map([[".webp", "image/webp"], [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"]])

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params
  try {
    const body = await readFile(uploadFilePath(filename))
    return new NextResponse(body, { headers: { "Content-Type": mime.get(path.extname(filename).toLowerCase()) || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } })
  } catch {
    const placeholder = await readFile(path.join(process.cwd(), "public", "placeholder-logo.png"))
    return new NextResponse(placeholder, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=60", "X-Upload-Fallback": "missing" } })
  }
}

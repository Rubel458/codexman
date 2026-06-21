import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { safeUploadFilename, uploadFilePath } from "@/lib/upload-storage";

const mime = new Map([
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

async function existingUploadPath(filename: string) {
  const persistentPath = uploadFilePath(filename);
  try {
    await stat(persistentPath);
    return persistentPath;
  } catch {
    const legacyPath = path.join(process.cwd(), "public", "uploads", filename);
    await stat(legacyPath);
    return legacyPath;
  }
}

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  try {
    const safeFilename = safeUploadFilename(filename);
    const filePath = await existingUploadPath(safeFilename);
    const fileStat = await stat(filePath);
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mime.get(path.extname(safeFilename).toLowerCase()) || "application/octet-stream",
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    const placeholder = await readFile(path.join(process.cwd(), "public", "placeholder-logo.png"));
    return new NextResponse(placeholder, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
        "X-Upload-Fallback": "missing",
      },
    });
  }
}

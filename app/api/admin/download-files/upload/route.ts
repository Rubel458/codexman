import { createWriteStream } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { logActivity } from "@/lib/activity-log";
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/security";
import { downloadFilePath, downloadFilenamePattern, downloadRoot } from "@/lib/download-storage";

const allowedExtensions = new Set([".zip", ".pdf", ".txt", ".csv", ".json", ".png", ".jpg", ".jpeg", ".webp"]);
const defaultMaxDownloadBytes = 50 * 1024 * 1024;

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function safeOriginalName(value: string) {
  const name = path.basename(sanitizeText(value || "download", 180)).replace(/[\r\n\\/]+/g, "-");
  return name || "download";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "Invalid security token" }, { status: 403 });

  const rate = await enforceRateLimit(
    `admin-download-upload:${session.sub}:${clientFingerprint(request)}`,
    positiveNumber(process.env.ADMIN_DOWNLOAD_UPLOAD_LIMIT_PER_HOUR, 120),
    60 * 60,
  );
  if (!rate.allowed) return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 });

  const maxBytes = positiveNumber(process.env.MAX_DOWNLOAD_UPLOAD_BYTES, defaultMaxDownloadBytes);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength && contentLength > maxBytes + 1024 * 1024) {
    return NextResponse.json({ error: `Maximum file size is ${Math.round(maxBytes / 1024 / 1024)} MB.` }, { status: 413 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Select a file." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: `Maximum file size is ${Math.round(maxBytes / 1024 / 1024)} MB.` }, { status: 400 });

  const originalFilename = safeOriginalName(file.name);
  const extension = path.extname(originalFilename).toLowerCase();
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Only ZIP, PDF, TXT, CSV, JSON and image files are allowed." }, { status: 400 });

  const fileName = `${randomUUID()}${extension}`;
  if (!downloadFilenamePattern.test(fileName)) return NextResponse.json({ error: "Invalid file name." }, { status: 400 });

  await mkdir(downloadRoot(), { recursive: true });
  const destination = downloadFilePath(fileName);
  try {
    await pipeline(Readable.fromWeb(file.stream() as any), createWriteStream(destination, { flags: "wx" }));
  } catch {
    await rm(destination, { force: true }).catch(() => undefined);
    return NextResponse.json({ error: "Unable to store this file safely." }, { status: 400 });
  }

  const payload = {
    fileName,
    originalFilename,
    fileMimeType: sanitizeText(file.type || "application/octet-stream", 120),
    fileSizeBytes: file.size,
  };
  await logActivity({ request, adminId: session.sub, username: session.username, action: "DOWNLOAD_FILE_UPLOADED", resource: "download-items", details: payload });
  return NextResponse.json({ file: payload }, { status: 201 });
}

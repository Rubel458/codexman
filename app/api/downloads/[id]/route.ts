import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadFilePath } from "@/lib/download-storage";
import { idSchema } from "@/lib/security";

function encodeFilename(filename: string) {
  return encodeURIComponent(filename).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success)
    return NextResponse.json({ error: "Invalid download." }, { status: 400 });

  const item = await prisma.downloadItem.findFirst({
    where: { id, published: true },
  });
  if (!item)
    return NextResponse.json({ error: "Download not found." }, { status: 404 });

  try {
    const filePath = downloadFilePath(item.fileName);
    const fileStat = await stat(filePath);
    await prisma.downloadItem
      .update({
        where: { id: item.id },
        data: { downloadCount: { increment: 1 } },
      })
      .catch(() => undefined);
    const filename = item.originalFilename || item.fileName;
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": item.fileMimeType || "application/octet-stream",
        "Content-Length": String(fileStat.size),
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "'")}"; filename*=UTF-8''${encodeFilename(filename)}`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "File is missing on the server." },
      { status: 404 },
    );
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { logActivity } from "@/lib/activity-log";
import { getResource } from "@/lib/admin-resources";
import { invalidateCmsCache } from "@/lib/cms-invalidation";
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit";
import { isTrustedOrigin, readJsonBody } from "@/lib/security";
import { validateAdminPayload } from "@/lib/admin-validation";

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
    return NextResponse.json(
      { error: "Request payload is too large." },
      { status: 413 },
    );
  if (error instanceof Error && error.message === "INVALID_URL")
    return NextResponse.json(
      { error: "One of the submitted URLs is not allowed." },
      { status: 400 },
    );
  if (error instanceof Error && error.message === "INVALID_RESOURCE_DATA")
    return NextResponse.json(
      { error: "Please check the submitted fields." },
      { status: 400 },
    );
  return NextResponse.json(
    { error: "Unable to process this CMS request." },
    { status: 400 },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await getSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await context.params;
  const config = getResource(resource);
  if (!config)
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const findOptions: Record<string, unknown> = {
    orderBy: { createdAt: "desc" },
    take: resource === "activity-logs" ? 300 : 200,
  };
  if (resource === "portfolios" || resource === "demos" || resource === "download-items" || resource === "blog-posts")
    findOptions.include = { category: true };
  const items = await (config.delegate() as any).findMany(findOptions);
  return NextResponse.json(
    { resource, label: config.label, items },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isTrustedOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  if (!(await verifyCsrf(request)))
    return NextResponse.json(
      { error: "Invalid security token" },
      { status: 403 },
    );
  const rate = await enforceRateLimit(
    `admin-write:${clientFingerprint(request)}`,
    180,
    60,
  );
  if (!rate.allowed)
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  const { resource } = await context.params;
  const config = getResource(resource);
  if (!config)
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (config.readOnly || ["leads", "media"].includes(resource))
    return NextResponse.json(
      { error: "This resource cannot be created here." },
      { status: 405 },
    );
  try {
    const data = validateAdminPayload(
      resource,
      await readJsonBody(request),
      config.allowed,
      "create",
    );
    const item = await (config.delegate() as any).create({ data });
    const invalidation = await invalidateCmsCache(`create:${resource}`);
    await logActivity({
      request,
      adminId: session.sub,
      username: session.username,
      action: "CMS_CREATE",
      resource,
      resourceId: item.id,
      details: { fields: Object.keys(data) },
    });
    return NextResponse.json(
      { item, committed: true, invalidation },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

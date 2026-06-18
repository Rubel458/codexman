import { NextResponse } from "next/server"
import { getSession, type AdminSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { getResource } from "@/lib/admin-resources"
import { invalidateCmsCache } from "@/lib/cms-invalidation"
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit"
import { idSchema, isTrustedOrigin, readJsonBody } from "@/lib/security"
import { validateAdminPayload } from "@/lib/admin-validation"
import { deleteMediaWithFiles } from "@/lib/media-storage"

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") return NextResponse.json({ error: "Request payload is too large." }, { status: 413 })
  if (error instanceof Error && error.message === "INVALID_URL") return NextResponse.json({ error: "One of the submitted URLs is not allowed." }, { status: 400 })
  if (error instanceof Error && error.message === "INVALID_RESOURCE_DATA") return NextResponse.json({ error: "Please check the submitted fields." }, { status: 400 })
  return NextResponse.json({ error: "Unable to process this CMS request." }, { status: 400 })
}

async function authorize(request: Request): Promise<AdminSession | NextResponse> {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  if (!await verifyCsrf(request)) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })
  const rate = await enforceRateLimit(`admin-write:${clientFingerprint(request)}`, 180, 60)
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 })
  return session
}

export async function PUT(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await authorize(request); if (auth instanceof NextResponse) return auth
  const { resource, id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid record identifier" }, { status: 400 })
  const config = getResource(resource)
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  if (config.readOnly) return NextResponse.json({ error: "This resource is read-only." }, { status: 405 })
  try {
    const data = validateAdminPayload(resource, await readJsonBody(request), config.allowed, "update")
    const item = await (config.delegate() as any).update({ where: { id }, data })
    const invalidation = await invalidateCmsCache(`update:${resource}:${id}`)
    await logActivity({ request, adminId: auth.sub, username: auth.username, action: resource === "leads" ? "LEAD_STATUS_UPDATED" : "CMS_UPDATE", resource, resourceId: id, details: { fields: Object.keys(data) } })
    return NextResponse.json({ item, committed: true, invalidation })
  } catch (error) { return errorResponse(error) }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await authorize(request); if (auth instanceof NextResponse) return auth
  const { resource, id } = await context.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid record identifier" }, { status: 400 })
  const config = getResource(resource)
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  if (config.readOnly || resource === "leads") return NextResponse.json({ error: "This resource cannot be deleted here." }, { status: 405 })
  if (resource === "media") await deleteMediaWithFiles(id)
  else await (config.delegate() as any).delete({ where: { id } })
  const invalidation = await invalidateCmsCache(`delete:${resource}:${id}`)
  await logActivity({ request, adminId: auth.sub, username: auth.username, action: "CMS_DELETE", resource, resourceId: id })
  return NextResponse.json({ ok: true, committed: true, invalidation })
}

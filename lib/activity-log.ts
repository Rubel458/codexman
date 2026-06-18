import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { clientFingerprint } from "@/lib/rate-limit"
import { sanitizeDeep, sanitizeText } from "@/lib/security"

type ActivityInput = {
  action: string
  request?: Request
  adminId?: string | null
  username?: string | null
  resource?: string | null
  resourceId?: string | null
  details?: unknown
}

export async function logActivity(input: ActivityInput) {
  try {
    const adminId = input.adminId && input.adminId !== "env-admin" ? input.adminId : null
    await prisma.activityLog.create({
      data: {
        action: sanitizeText(input.action, 120),
        resource: input.resource ? sanitizeText(input.resource, 120) : null,
        resourceId: input.resourceId ? sanitizeText(input.resourceId, 180) : null,
        username: input.username ? sanitizeText(input.username, 120) : null,
        details: input.details == null ? undefined : JSON.parse(JSON.stringify(sanitizeDeep(input.details))) as Prisma.InputJsonValue,
        ipHash: input.request ? clientFingerprint(input.request) : null,
        userAgent: input.request?.headers.get("user-agent")?.slice(0, 500) || null,
        adminId,
      },
    })
  } catch (error) {
    console.error("[activity-log] Unable to persist administrative audit event.", error)
  }
}

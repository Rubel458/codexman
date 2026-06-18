import { createHash } from "node:crypto"
import { incrementWithExpiry } from "@/lib/redis"

function cleanIp(value: string | null) {
  const candidate = value?.trim()
  return candidate && candidate.length <= 120 ? candidate : null
}

export function clientAddress(request: Request) {
  if (process.env.TRUST_PROXY_HEADERS === "true") {
    // Nginx must overwrite these headers. Never append untrusted client values.
    return cleanIp(request.headers.get("x-real-ip"))
      || cleanIp(request.headers.get("x-forwarded-for")?.split(",")[0] || null)
      || "unknown"
  }
  return "unknown"
}

export function clientFingerprint(request: Request) {
  return createHash("sha256").update(clientAddress(request)).digest("hex")
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const count = await incrementWithExpiry(`ratelimit:${key}`, windowSeconds)
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}

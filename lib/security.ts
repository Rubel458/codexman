import { z } from "zod"

const MAX_JSON_BYTES = 256 * 1024
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"])
const urlLike = /(url|href|website|image|images|screenshots)$/i

export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const incoming = new URL(origin)
    const configured = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : null
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host")
    if (configured && incoming.origin === configured.origin) return true
    return !!forwardedHost && incoming.host === forwardedHost
  } catch {
    return false
  }
}

export async function readJsonBody(request: Request, maxBytes = MAX_JSON_BYTES) {
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > maxBytes) throw new Error("PAYLOAD_TOO_LARGE")
  const text = await request.text()
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new Error("PAYLOAD_TOO_LARGE")
  try { return JSON.parse(text) as unknown } catch { throw new Error("INVALID_JSON") }
}

export function sanitizeText(value: string, maxLength = 12000) {
  return value.replace(/\0/g, "").trim().slice(0, maxLength)
}

export function sanitizeUrl(value: string, allowEmpty = true) {
  const clean = sanitizeText(value, 2048)
  if (!clean && allowEmpty) return ""
  if (clean.startsWith("//")) throw new Error("INVALID_URL")
  if (clean.startsWith("/") || clean.startsWith("#")) return clean
  try {
    const url = new URL(clean)
    if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return clean
  } catch {}
  throw new Error("INVALID_URL")
}

export function sanitizeDeep(value: unknown, key = "", depth = 0): unknown {
  if (depth > 8) return null
  if (typeof value === "string") return urlLike.test(key) ? sanitizeUrl(value) : sanitizeText(value)
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "boolean" || value == null) return value
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitizeDeep(item, key, depth + 1))
  if (typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const [entryKey, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (UNSAFE_KEYS.has(entryKey)) continue
      result[entryKey] = sanitizeDeep(entryValue, entryKey, depth + 1)
    }
    return result
  }
  return null
}

export function pickAllowed(input: unknown, allowed: readonly string[]) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {}
  const source = input as Record<string, unknown>
  const payload: Record<string, unknown> = {}
  for (const field of allowed) if (Object.prototype.hasOwnProperty.call(source, field)) payload[field] = sanitizeDeep(source[field], field)
  return payload
}

export const idSchema = z.string().min(1).max(160)

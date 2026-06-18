import { randomBytes, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { isTrustedOrigin } from "@/lib/security"

export const CSRF_COOKIE = "itlab_csrf"

export function newCsrfToken() { return randomBytes(32).toString("hex") }

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false
  try { return timingSafeEqual(Buffer.from(a), Buffer.from(b)) } catch { return false }
}

export async function verifyCsrf(request: Request) {
  if (!isTrustedOrigin(request)) return false
  const header = request.headers.get("x-csrf-token") || ""
  const cookie = (await cookies()).get(CSRF_COOKIE)?.value || ""
  return safeEqual(header, cookie)
}

export function isSameSiteBrowserRequest(request: Request) {
  if (!isTrustedOrigin(request)) return false
  const fetchSite = request.headers.get("sec-fetch-site")
  if (!fetchSite) return true
  return fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none"
}

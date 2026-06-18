export function shouldUseSecureCookies(request?: Request) {
  if (process.env.COOKIE_SECURE === "true") return true
  if (process.env.COOKIE_SECURE === "false") return false
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  if (siteUrl.startsWith("https://")) return true
  const forwardedProto = request?.headers.get("x-forwarded-proto") || ""
  if (forwardedProto.split(",")[0]?.trim() === "https") return true
  return false
}

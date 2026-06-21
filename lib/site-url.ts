const productionFallbackUrl = "https://itlabbd.com"
const localFallbackUrl = "http://localhost:3000"

function cleanUrl(value: string | undefined | null) {
  const candidate = value?.trim()
  if (!candidate) return null
  try {
    const url = new URL(candidate)
    if (!["http:", "https:"].includes(url.protocol)) return null
    return url.origin.replace(/\/$/, "")
  } catch {
    return null
  }
}

export function getSiteUrl() {
  return (
    cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanUrl(process.env.SITE_URL) ||
    (process.env.NODE_ENV === "production" ? productionFallbackUrl : localFallbackUrl)
  )
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl()
  const route = path.startsWith("/") ? path : `/${path}`
  return `${base}${route === "/" ? "" : route}`
}

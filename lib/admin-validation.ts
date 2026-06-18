import { pickAllowed } from "@/lib/security"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value) }
function expectString(data: Record<string, unknown>, key: string, required = false, max = 2048) {
  const value = data[key]
  if (value == null || value === "") { if (required) throw new Error("INVALID_RESOURCE_DATA"); return }
  if (typeof value !== "string" || value.length > max) throw new Error("INVALID_RESOURCE_DATA")
}
function expectInteger(data: Record<string, unknown>, key: string, min = -100000, max = 100000) {
  const value = data[key]
  if (value == null) return
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) throw new Error("INVALID_RESOURCE_DATA")
}
function expectBoolean(data: Record<string, unknown>, key: string) { const value = data[key]; if (value != null && typeof value !== "boolean") throw new Error("INVALID_RESOURCE_DATA") }
function expectSlug(data: Record<string, unknown>, key = "slug", required = false) {
  expectString(data, key, required, 160)
  const value = data[key]
  if (typeof value === "string" && value && !slugPattern.test(value)) throw new Error("INVALID_RESOURCE_DATA")
}
function expectJsonObject(data: Record<string, unknown>, key: string) { const value = data[key]; if (value != null && !isRecord(value)) throw new Error("INVALID_RESOURCE_DATA") }

export function validateAdminPayload(resource: string, input: unknown, allowed: readonly string[], mode: "create" | "update") {
  const data = pickAllowed(input, allowed)
  const required = mode === "create"
  switch (resource) {
    case "menus": expectString(data, "label", required, 120); expectString(data, "href", required, 2048); expectString(data, "parentId", false, 160); expectInteger(data, "sortOrder"); expectBoolean(data, "enabled"); break
    case "pages": expectSlug(data); expectString(data, "title", required, 180); expectString(data, "excerpt", false, 500); expectJsonObject(data, "content"); expectBoolean(data, "published"); break
    case "services": expectSlug(data, "slug", required); expectString(data, "title", required, 180); expectString(data, "excerpt", required, 1000); expectString(data, "icon", false, 120); expectJsonObject(data, "content"); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "team-members": expectSlug(data, "slug", required); expectString(data, "name", required, 160); expectString(data, "role", required, 160); expectString(data, "imageUrl", required, 2048); expectString(data, "email", false, 180); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "portfolios": expectSlug(data, "slug", required); expectString(data, "title", required, 180); expectString(data, "imageUrl", required, 2048); expectString(data, "categoryId", false, 160); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "portfolio-categories": case "demo-categories": expectString(data, "name", required, 160); expectSlug(data, "slug", required); break
    case "demos": expectSlug(data, "slug", required); expectString(data, "title", required, 180); expectString(data, "imageUrl", required, 2048); expectString(data, "categoryId", false, 160); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "testimonials": expectString(data, "brand", required, 160); expectString(data, "quote", required, 3000); expectString(data, "author", required, 160); expectInteger(data, "rating", 1, 5); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "logos": expectString(data, "name", required, 160); expectInteger(data, "sortOrder"); expectBoolean(data, "published"); break
    case "seo": expectString(data, "route", required, 500); expectString(data, "title", required, 180); expectString(data, "description", required, 500); expectBoolean(data, "noIndex"); break
    case "homepage-sections": expectString(data, "title", required, 180); expectJsonObject(data, "content"); expectInteger(data, "sortOrder"); expectBoolean(data, "enabled"); break
    case "leads": { const status = data.status; if (status != null && !["NEW", "IN_PROGRESS", "CLOSED", "SPAM"].includes(String(status))) throw new Error("INVALID_RESOURCE_DATA"); break }
    case "settings": expectString(data, "key", required, 160); expectString(data, "group", false, 120); break
    case "media": expectString(data, "altText", false, 240); break
  }
  return data
}

import "dotenv/config"
import path from "node:path"

const errors: string[] = []
const env = process.env
function required(key: string) { const value = env[key]?.trim(); if (!value) errors.push(`${key} is required`); return value || "" }
function rejectPlaceholder(key: string, value: string) { if (/replace|change|example|generation-only/i.test(value)) errors.push(`${key} still contains a placeholder value`) }

const databaseUrl = required("DATABASE_URL")
const sessionSecret = required("SESSION_SECRET")
const analyticsSecret = required("ANALYTICS_HASH_SECRET")
const siteUrl = required("NEXT_PUBLIC_SITE_URL")
const uploadDir = required("UPLOAD_DIR")
const backupDir = required("BACKUP_DIR")

for (const [key, value] of [["DATABASE_URL", databaseUrl], ["SESSION_SECRET", sessionSecret], ["ANALYTICS_HASH_SECRET", analyticsSecret], ["NEXT_PUBLIC_SITE_URL", siteUrl]] as const) rejectPlaceholder(key, value)
if (sessionSecret.length < 32) errors.push("SESSION_SECRET must contain at least 32 characters")
if (analyticsSecret.length < 32) errors.push("ANALYTICS_HASH_SECRET must contain at least 32 characters")
try { const parsed = new URL(databaseUrl); if (!["postgresql:", "postgres:"].includes(parsed.protocol)) errors.push("DATABASE_URL must use PostgreSQL") } catch { errors.push("DATABASE_URL is not a valid URL") }
try { const parsed = new URL(siteUrl); if (parsed.protocol !== "https:") errors.push("NEXT_PUBLIC_SITE_URL must use HTTPS in production") } catch { errors.push("NEXT_PUBLIC_SITE_URL is not a valid URL") }
if (!path.isAbsolute(uploadDir)) errors.push("UPLOAD_DIR must be an absolute VPS path")
if (!path.isAbsolute(backupDir)) errors.push("BACKUP_DIR must be an absolute VPS path")
if (env.ALLOW_ENV_AUTH_FALLBACK === "true") errors.push("ALLOW_ENV_AUTH_FALLBACK must remain false in production")
if (env.TRUST_PROXY_HEADERS !== "true") errors.push("TRUST_PROXY_HEADERS must be true behind the included Nginx proxy")
if (env.RATE_LIMIT_FAIL_CLOSED !== "true") errors.push("RATE_LIMIT_FAIL_CLOSED must be true in production")

if (errors.length) {
  console.error("Production environment check failed:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log("Production environment check passed.")

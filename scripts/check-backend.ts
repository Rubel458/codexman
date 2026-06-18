import "dotenv/config"
import { prisma } from "../lib/prisma"
import { normalizeBcryptHash } from "../lib/admin-password"

async function main() {
  const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`
  console.log(result[0]?.ok === 1 ? "PostgreSQL: OK" : "PostgreSQL: unexpected response")
  console.log(process.env.REDIS_URL ? "Redis URL: configured" : "Redis URL: not configured (memory fallback enabled)")
  const hashReady=!!normalizeBcryptHash(process.env.ADMIN_PASSWORD_HASH)
  const localPlain=process.env.NODE_ENV!=="production"&&!!process.env.ADMIN_PASSWORD
  console.log(process.env.ADMIN_USERNAME && (hashReady || localPlain) ? "Admin bootstrap ENV: configured" : "Admin bootstrap ENV: missing or invalid")
}

main().catch((error) => { console.error("Backend health check failed", error); process.exit(1) }).finally(() => prisma.$disconnect())

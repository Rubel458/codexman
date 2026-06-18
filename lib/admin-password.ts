import { timingSafeEqual } from "node:crypto"
import { compare, hash } from "bcryptjs"

const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/

export function normalizeBcryptHash(value?: string | null) {
  if (!value) return null
  const normalized = value.trim().replace(/^['"]|['"]$/g, "").replace(/\$\$/g, "$")
  return BCRYPT_PATTERN.test(normalized) ? normalized : null
}

export async function buildBootstrapHash() {
  const fromHash = normalizeBcryptHash(process.env.ADMIN_PASSWORD_HASH)
  if (fromHash) return fromHash
  const plain = process.env.ADMIN_PASSWORD
  if (plain) return hash(plain, 12)
  if (process.env.NODE_ENV !== "production") return hash("ChangeMeNow!", 12)
  throw new Error("ADMIN_PASSWORD_HASH must contain a valid bcrypt hash in production")
}

export async function compareWithEnvPassword(password: string) {
  const fromHash = normalizeBcryptHash(process.env.ADMIN_PASSWORD_HASH)
  if (fromHash) return compare(password, fromHash)
  if (process.env.NODE_ENV === "production") return false
  const plain = process.env.ADMIN_PASSWORD
  if (!plain) return false
  const left = Buffer.from(password)
  const right = Buffer.from(plain)
  return left.length === right.length && timingSafeEqual(left, right)
}

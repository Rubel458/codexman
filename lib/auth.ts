import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { compareWithEnvPassword } from "@/lib/admin-password"
import { prisma } from "@/lib/prisma"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

const SESSION_COOKIE = "itlab_admin_session"
const LOCK_THRESHOLD = 5
const LOCK_MINUTES = 10
const FAKE_HASH = "$2b$12$W9To7OaXrZ9YlP0XwQqJ.eQMR3zjhEW2yx5Et54JuQYjufx3CMGMi"

const secret = () => {
  const value = process.env.SESSION_SECRET
  if (!value && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required in production")
  return new TextEncoder().encode(value || "development-only-change-me-please-32-chars")
}

export type AdminSession = { sub: string; username: string; sessionVersion: number }
export type AuthenticatedAdmin = { id: string; username: string; sessionVersion: number }
export type AuthenticationResult = { status: "ok"; admin: AuthenticatedAdmin } | { status: "locked"; lockedUntil: Date } | { status: "invalid" }

export async function authenticateAdmin(username: string, password: string): Promise<AuthenticationResult> {
  try {
    const admin = await prisma.admin.findUnique({ where: { username } })
    if (admin?.active) {
      const now = new Date()
      if (admin.lockedUntil && admin.lockedUntil > now) return { status: "locked", lockedUntil: admin.lockedUntil }
      const valid = await compare(password, admin.passwordHash)
      if (valid) {
        const updated = await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: now, failedLoginAttempts: 0, lockedUntil: null } })
        return { status: "ok", admin: { id: updated.id, username: updated.username, sessionVersion: updated.sessionVersion } }
      }
      const attempts = admin.lockedUntil && admin.lockedUntil <= now ? 1 : admin.failedLoginAttempts + 1
      const lockedUntil = attempts >= LOCK_THRESHOLD ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null
      await prisma.admin.update({ where: { id: admin.id }, data: { failedLoginAttempts: attempts, lockedUntil } })
      return lockedUntil ? { status: "locked", lockedUntil } : { status: "invalid" }
    }
    await compare(password, FAKE_HASH).catch(() => false)
  } catch (error) {
    console.error("[auth] Database authentication unavailable. Check PostgreSQL permissions and migrations.", error)
  }

  const allowFallback = process.env.NODE_ENV !== "production" || process.env.ALLOW_ENV_AUTH_FALLBACK === "true"
  const envUsername = process.env.ADMIN_USERNAME
  if (allowFallback && envUsername && username === envUsername && await compareWithEnvPassword(password)) return { status: "ok", admin: { id: "env-admin", username, sessionVersion: 0 } }
  return { status: "invalid" }
}

export async function createSession(admin: AuthenticatedAdmin) {
  const token = await new SignJWT({ username: admin.username, sessionVersion: admin.sessionVersion })
    .setProtectedHeader({ alg: "HS256" }).setSubject(admin.id).setIssuer("itlabbd-cms").setAudience("itlabbd-admin").setIssuedAt().setExpirationTime("8h").sign(secret())
  ;(await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: shouldUseSecureCookies(), maxAge: 60 * 60 * 8, path: "/" })
}

export async function clearSession() { (await cookies()).delete(SESSION_COOKIE) }

export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "itlabbd-cms", audience: "itlabbd-admin" })
    if (!payload.sub || typeof payload.username !== "string" || typeof payload.sessionVersion !== "number") return null
    if (payload.sub !== "env-admin") {
      const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { username: true, active: true, sessionVersion: true } })
      if (!admin?.active || admin.username !== payload.username || admin.sessionVersion !== payload.sessionVersion) return null
    } else if (process.env.NODE_ENV === "production" && process.env.ALLOW_ENV_AUTH_FALLBACK !== "true") return null
    return { sub: payload.sub, username: payload.username, sessionVersion: payload.sessionVersion }
  } catch { return null }
}

export async function requireSession() { const session = await getSession(); if (!session) throw new Error("UNAUTHORIZED"); return session }

import { NextResponse } from "next/server"
import { shouldUseSecureCookies } from "@/lib/cookie-security"
import { CSRF_COOKIE, newCsrfToken } from "@/lib/csrf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const token = newCsrfToken()
    const response = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } })
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: shouldUseSecureCookies(request),
      path: "/",
      maxAge: 60 * 60,
    })
    return response
  } catch (error) {
    console.error("[csrf] Failed to create CSRF token", error)
    return NextResponse.json({ error: "Unable to create security token." }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

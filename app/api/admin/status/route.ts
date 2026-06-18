import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 })
  let database = false
  try { await prisma.$queryRaw`SELECT 1`; database = true } catch { database = false }
  return NextResponse.json({ authenticated: true, username: session.username, database })
}

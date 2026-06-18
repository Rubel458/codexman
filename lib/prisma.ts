import "dotenv/config"
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __itlabPrisma: PrismaClient | undefined
}

export const prisma = global.__itlabPrisma ?? new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] })

if (process.env.NODE_ENV !== "production") global.__itlabPrisma = prisma

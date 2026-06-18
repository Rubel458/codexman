import "dotenv/config"
import { defineConfig } from "prisma/config"

// A local fallback allows `npm install` and `prisma generate` to run before
// `.env` has been copied. Runtime and migration commands still use the
// DATABASE_URL value from `.env` whenever it is available.
const databaseUrl = process.env.DATABASE_URL || "postgresql://itlabbd:generation-only@127.0.0.1:5432/itlabbd?schema=public"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
})

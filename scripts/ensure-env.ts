import "dotenv/config"

const required = ["DATABASE_URL"]
const missing = required.filter(key => !process.env[key])
if (missing.length) {
  console.error(`Missing environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`)
  console.error("Create .env first: Copy-Item .env.example .env")
  process.exit(1)
}

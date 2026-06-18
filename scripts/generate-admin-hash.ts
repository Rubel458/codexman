import { hash } from "bcryptjs"

async function main() {
  const password = process.argv[2]
  if (!password || password.length < 12) {
    console.error("Use: npm run admin:hash -- 'YourStrongPassword' (minimum 12 characters)")
    process.exit(1)
  }
  console.log(await hash(password, 12))
  console.error("Paste this bcrypt hash into ADMIN_PASSWORD_HASH using single quotes in .env")
}

main().catch((error) => { console.error(error); process.exit(1) })

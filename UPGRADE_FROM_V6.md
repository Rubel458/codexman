# Upgrade from V6 to V7

V7 does not add a new Prisma model or require a new migration. It adds a seed environment-loading fix, a calmer public visual system and a form-based admin CMS.

## Upgrade steps

```powershell
# Stop the development server first with Ctrl+C
Copy-Item .env .env.backup
# Replace project files with V7 while keeping your .env file
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run dev
```

For an existing working V6 database, do not run `docker compose down -v`.

## Important seed line

Confirm that `prisma/seed.ts` begins with:

```ts
import 'dotenv/config'
```

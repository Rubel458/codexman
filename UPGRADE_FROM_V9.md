# Upgrade from V9 to V10

V10 adds a production-hardening migration, activity logs, account locking, database backups, WebP media generation and structured SEO data.

## Important

Keep your PostgreSQL volume. Do **not** run:

```powershell
docker compose down -v
```

## Upgrade commands

Stop the development server first with `Ctrl+C`, copy V10 into a new folder and preserve your existing `.env`.

Then run:

```powershell
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run dev
```

## New migration

```text
prisma/migrations/20260614010000_production_hardening/migration.sql
```

It adds:

- `Admin.failedLoginAttempts`
- `Admin.lockedUntil`
- `Media.originalUrl`
- `Media.optimizedUrl`
- `Media.width`
- `Media.height`
- `ActivityLog`
- `DatabaseBackup`
- Backup enums and indexes

## New environment values

Append:

```env
BACKUP_DIR="./storage/backups"
PG_DUMP_PATH="pg_dump"
PG_RESTORE_PATH="pg_restore"
ALLOW_ADMIN_RESTORE="false"
```

## Verify

```powershell
npm run backend:check
npm run typecheck
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/admin
http://localhost:3000/admin/activity-logs
http://localhost:3000/admin/backups
```

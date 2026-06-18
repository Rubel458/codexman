# ITLABBD CMS V15 - System Setup

## Local development

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```
2. Generate two different URL-safe passwords and replace the placeholders in `.env`:
```powershell
# Windows PowerShell example
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```
Use one password for `POSTGRES_PASSWORD` and another for `APP_DB_PASSWORD`. Set `DATABASE_URL` with the same application password used by `APP_DB_PASSWORD`.

3. Start private database services:
```powershell
docker compose up -d
```
4. Install and initialize:
```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run lint
npm run typecheck
npm run build
```

## Production
Read `VPS_DEPLOYMENT_V15.md` and `UPGRADE_FROM_V14.md`.

Use persistent directories outside release folders:
```env
UPLOAD_DIR="/var/lib/itlabbd/uploads"
BACKUP_DIR="/var/lib/itlabbd/backups"
TRUST_PROXY_HEADERS="true"
RATE_LIMIT_FAIL_CLOSED="true"
```

Never commit `.env`. Never use `docker compose down -v` during a normal update.

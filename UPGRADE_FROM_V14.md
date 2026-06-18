# Upgrade from V14 to V15

V15 fixes the release blockers found during the final production audit. It does not add a Prisma migration.

## Preserve data
Never run `docker compose down -v` during an update. Copy your existing `.env` and media files before switching release folders.

## Persistent storage
On the VPS create:
```bash
sudo mkdir -p /var/lib/itlabbd/uploads /var/lib/itlabbd/backups
sudo chown -R www-data:www-data /var/lib/itlabbd
```
Set:
```env
UPLOAD_DIR="/var/lib/itlabbd/uploads"
BACKUP_DIR="/var/lib/itlabbd/backups"
TRUST_PROXY_HEADERS="true"
```
Copy previous uploads once:
```bash
sudo cp -a /var/www/itlabbd-old/public/uploads/. /var/lib/itlabbd/uploads/
```

## Database password rotation
Generate unique passwords, then rotate the actual roles inside PostgreSQL before updating `DATABASE_URL`. The Compose bootstrap variables affect new volumes only.

## Deploy
```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run lint
npm run typecheck
npm audit --audit-level=high
npm run build
```
Install the updated Nginx and systemd templates, then restart the service.

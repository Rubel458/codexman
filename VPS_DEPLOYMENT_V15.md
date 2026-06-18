# ITLABBD CMS V15 - VPS Deployment

## 1. Create production directories
```bash
sudo mkdir -p /var/www/itlabbd /var/lib/itlabbd/uploads /var/lib/itlabbd/backups
sudo chown -R www-data:www-data /var/lib/itlabbd
```

## 2. Create `.env`
Generate URL-safe secrets with `openssl rand -hex 32`. Never reuse the PostgreSQL superuser password as the application password.

Required production values:
```env
NODE_ENV="production"
POSTGRES_DB="itlabbd"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="<unique-superuser-password>"
APP_DB_PASSWORD="<unique-application-password>"
DATABASE_URL="postgresql://itlabbd:<url-encoded-application-password>@127.0.0.1:5432/itlabbd?schema=public"
REDIS_URL="redis://127.0.0.1:6379"
SESSION_SECRET="<random-hex-secret>"
ANALYTICS_HASH_SECRET="<different-random-hex-secret>"
NEXT_PUBLIC_SITE_URL="https://example.com"
ALLOW_ENV_AUTH_FALLBACK="false"
UPLOAD_DIR="/var/lib/itlabbd/uploads"
BACKUP_DIR="/var/lib/itlabbd/backups"
TRUST_PROXY_HEADERS="true"
RATE_LIMIT_FAIL_CLOSED="true"
ALLOW_ADMIN_RESTORE="false"
```

## 3. Start private PostgreSQL and Redis
```bash
docker compose up -d
docker compose ps
```
PostgreSQL and Redis bind to `127.0.0.1` only and use `restart: unless-stopped`.

## 4. Validate and build
```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
NODE_ENV=production npm run prod:check
npm run lint
npm run typecheck
npm audit --audit-level=high
npm run build
```

## 5. Install services
```bash
sudo cp deploy/systemd/itlabbd.service /etc/systemd/system/itlabbd.service
sudo systemctl daemon-reload
sudo systemctl enable --now itlabbd
sudo cp deploy/nginx/itlabbd.conf /etc/nginx/sites-available/itlabbd
sudo ln -s /etc/nginx/sites-available/itlabbd /etc/nginx/sites-enabled/itlabbd
sudo nginx -t && sudo systemctl reload nginx
```
Replace `example.com` in the Nginx file before enabling it.

## 6. Install backup schedule
```bash
sudo touch /var/log/itlabbd-backup.log
sudo chown www-data:www-data /var/log/itlabbd-backup.log
sudo cp deploy/cron/itlabbd-backups.cron /etc/cron.d/itlabbd-backups
sudo chmod 644 /etc/cron.d/itlabbd-backups
```
Test one staging backup and one staging restore before launch. Store encrypted off-server copies.

## 7. Existing database volumes
The Compose bootstrap variables initialize new volumes only. To rotate an existing role password, run `ALTER ROLE` inside PostgreSQL and then update `DATABASE_URL`. Never run `docker compose down -v` during a normal release update.

## 8. Existing media
Copy historical uploads once:
```bash
sudo cp -a /var/www/itlabbd-old/public/uploads/. /var/lib/itlabbd/uploads/
sudo chown -R www-data:www-data /var/lib/itlabbd/uploads
```

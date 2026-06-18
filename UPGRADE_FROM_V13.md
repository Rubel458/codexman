# Upgrade from V13 to V14

V14 is a real-time CMS update release. It does not add a Prisma migration.

## Preserve these files

Copy your existing `.env` and uploaded images into the V14 directory before starting the new version.

```bash
cp /var/www/itlabbd/.env /var/www/itlabbd-v14/.env
mkdir -p /var/www/itlabbd-v14/public/uploads
cp -a /var/www/itlabbd/public/uploads/. /var/www/itlabbd-v14/public/uploads/
```

## Add cache settings

Append these values to `.env`:

```env
CMS_CACHE_DISABLED="false"
CMS_CACHE_TTL_SECONDS="10"
CMS_FALLBACK_CACHE_TTL_SECONDS="5"
```

For temporary zero-cache debugging, change only:

```env
CMS_CACHE_DISABLED="true"
```

Restart the Node.js service whenever `.env` changes.

## Install and validate

```bash
cd /var/www/itlabbd-v14
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run typecheck
npm audit
npm run build
```

## Switch the service

Update the systemd `WorkingDirectory` if you deploy into a new folder, then restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart itlabbd
sudo systemctl status itlabbd
journalctl -u itlabbd -f
```

## Acceptance test

Follow `REALTIME_CMS.md`. Every successful save should print `[cms-invalidation] completed` in the server logs and appear immediately on a refreshed public page.

# ITLABBD CMS V15 - Frontend Troubleshooting

## Homepage does not open quickly
Check:
```bash
docker compose ps
npm run backend:check
journalctl -u itlabbd -f
```
Recommended `.env` values:
```env
REDIS_CONNECT_TIMEOUT_MS="700"
REDIS_OPERATION_TIMEOUT_MS="700"
CMS_QUERY_TIMEOUT_MS="1500"
CMS_CACHE_TTL_SECONDS="10"
CMS_FALLBACK_CACHE_TTL_SECONDS="5"
```

## CMS changes appear stale
Temporarily use:
```env
CMS_CACHE_DISABLED="true"
```
Restart the Node service, test, then restore `false`. Verify Redis with:
```bash
redis-cli -u redis://127.0.0.1:6379 ping
```

## Uploaded media is missing after a release switch
On production, use:
```env
UPLOAD_DIR="/var/lib/itlabbd/uploads"
```
Copy historical files once:
```bash
sudo mkdir -p /var/lib/itlabbd/uploads
sudo cp -a /var/www/itlabbd-old/public/uploads/. /var/lib/itlabbd/uploads/
sudo chown -R www-data:www-data /var/lib/itlabbd/uploads
```

## Build checks
```bash
rm -rf .next
rm -f tsconfig.tsbuildinfo
npm run lint
npm run typecheck
npm run build
```
The V15 build script intentionally uses Webpack for stable VPS compilation.

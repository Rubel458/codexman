# Upgrade from V12 to V13

V13 fixes the slow public frontend, the backend health-check environment error and the sitemap build timeout reported after V12.

## Preserve your data

Do **not** run `docker compose down -v`. Keep your existing PostgreSQL volume and copy your existing `.env` and `public/uploads` directory into the V13 folder.

## Upgrade commands

```powershell
Copy-Item "D:\works\itlabbd-old\.env" "D:\works\itlabbd\.env" -Force
Copy-Item "D:\works\itlabbd-old\public\uploads\*" "D:\works\itlabbd\public\uploads\" -Recurse -Force

npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run typecheck
npm run build
npm run dev
```

## Optional timeout values

The defaults are already safe. They can be tuned in `.env` when needed:

```env
REDIS_CONNECT_TIMEOUT_MS="700"
REDIS_OPERATION_TIMEOUT_MS="700"
CMS_QUERY_TIMEOUT_MS="1500"
```

Redis remains optional. When unavailable, the site immediately uses an in-memory cache and bundled fallback content instead of waiting for a long network timeout.

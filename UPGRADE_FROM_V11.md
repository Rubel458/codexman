# Upgrade from V11 to V12

V12 fixes the Global Platforms admin 404, restores the Name / Email / Phone / Message contact inputs, fixes TypeScript build errors and serves runtime uploads through a dedicated safe route.

## Preserve your database
Do not run `docker compose down -v`.

## Upgrade commands
```powershell
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

## Existing uploaded media
When moving to a newly extracted directory, copy the previous `public/uploads` folder into the new project directory. V12 adds a safe runtime `/uploads/[filename]` route so newly uploaded images are served correctly. Missing historical files show a placeholder instead of a broken-image error.

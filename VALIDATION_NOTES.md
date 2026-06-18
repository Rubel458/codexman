# ITLABBD CMS V13 Validation Notes

## Corrective scope

V13 fixes regressions reported after V12:

- Standalone backend scripts reliably load `.env` through `dotenv/config`.
- Database commands now stop early with a clear message when `.env` or `DATABASE_URL` is missing.
- Redis connection and operation attempts have short deadlines and memory fallback.
- CMS reads have a short database deadline and bundled fallback content.
- `/sitemap.xml` is now a runtime-only route handler with a local fallback, so it cannot block `next build`.
- Existing `/uploads/[filename]` serving and historical placeholder fallback are retained.

## Packaging validation

- Parsed TypeScript / TSX source files with zero syntax diagnostics.
- Confirmed `lib/prisma.ts` loads `dotenv/config`.
- Confirmed `scripts/check-backend.ts` loads `dotenv/config`.
- Confirmed Redis fail-fast timeout configuration exists.
- Confirmed the runtime `/sitemap.xml` route exists and the old static metadata sitemap file was removed.
- Confirmed `package-lock.json` contains no internal package-gateway URLs.
- Confirmed the archive excludes `.env`, `node_modules` and `.next`.

## Required target-machine validation

Run the following on Windows or the VPS after copying `.env`:

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run typecheck
npm run build
npm run dev
```

## V14 real-time CMS validation

- Public CMS routes use `revalidate = 0`.
- CMS cache TTL defaults to 10 seconds; fallback TTL defaults to 5 seconds.
- `CMS_CACHE_DISABLED=true` bypasses CMS cache for debugging.
- All generic CMS create/update/delete routes use `invalidateCmsCache()`.
- Branding updates and manual cache clears use `invalidateCmsCache()`.
- `invalidateCmsCache()` purges `cms:` Redis/memory keys and calls `revalidatePath("/", "layout")`.
- Admin editors notify open browser tabs and call `router.refresh()` after successful saves.
- Public HTML cache-control rules are `no-store`.
- TypeScript validation passed using a temporary local Prisma declaration because the packaging environment could not download Prisma binaries.
- `npm audit` returned 0 vulnerabilities.

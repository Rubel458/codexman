# V18.7 Build Fix + Dynamic Header Icons

## Fixed

- Fixed the TypeScript build error in `app/api/admin/footer-settings/route.ts` by typing footer JSON payload values as Prisma JSON input values instead of `unknown`.
- Added dynamic Header Icon 1, Header Icon 2 and Header Icon 3 management inside Website Settings / Branding.
- Header top-bar icons are no longer hardcoded to Twitter, Facebook and LinkedIn.
- Each header icon now supports:
  - icon type
  - associated text / label
  - link URL
- Kept legacy Twitter/Facebook/LinkedIn URL fields for backward compatibility.
- Added safe defaults so older cached admin forms do not break when saving settings.
- Improved header icon hover/target behavior without changing the existing header layout.

## Validation

- TypeScript check was run in this sandbox with a local Prisma type stub because Prisma engine download is blocked in this environment.
- The original failing TypeScript issue is fixed.
- No database migration is required; the update uses the existing `Settings` table.

## Commands

Local/server check:

```bash
npm install
npm run build
```

Git push:

```bash
git add .
git commit -m "Fix footer settings build and add dynamic header icons"
git push origin main
```

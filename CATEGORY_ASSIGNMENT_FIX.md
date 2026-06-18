# ITLABBD CMS V17 — Category Assignment Fix

This release is intentionally small and focused. It only fixes CMS category assignment for Portfolio Projects and Demo Items.

## Fixed

- Portfolio Project editor now loads Portfolio Categories from the backend.
- Portfolio Project editor now shows a real category dropdown instead of requiring a copied category ID.
- Demo Item editor now loads Demo Categories from the backend.
- Demo Item editor now shows a real category dropdown instead of requiring a copied category ID.
- Admin list responses for Portfolio Projects and Demo Items now include the related category object, so the category is visible in the admin list details.
- Textarea fields remain multiline-safe and keep Enter/new-line behavior.

## No database migration

No Prisma schema change is required. The existing fields are already present:

- `Portfolio.categoryId`
- `Demo.categoryId`

## Deploy notes

Run the normal production update commands:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run typecheck
npm run build
```

Then redeploy/restart the app container.

## Files changed

- `components/admin/resource-manager.tsx`
- `app/api/admin/[resource]/route.ts`

# ITLABBD CMS V18 — Admin Usability Fix

This release focuses only on admin usability and data assignment in existing CMS resources.

## Fixed

- Portfolio project category selector now loads Portfolio Categories from `/api/admin/portfolio-categories`.
- Demo item category selector now loads Demo Categories from `/api/admin/demo-categories`.
- Selectors show a clear message when no category records are available or when the API cannot load them.
- Portfolio screenshots now use a proper multi-image upload UI with previews, remove buttons and repeatable uploads.
- Service additional images now use the same multi-image upload UI instead of requiring manual image URLs.
- Multi-line fields preserve Enter/new-line behavior in modal forms.
- Text list fields such as technologies, skills, highlights and other line-based content are normalized only at save time.
- Category relationships continue using the existing `categoryId` fields; no Prisma migration is required.

## Database impact

No database migration is required. Existing data is preserved.

Existing relationships remain:

- `Portfolio.categoryId` → `PortfolioCategory.id`
- `Demo.categoryId` → `DemoCategory.id`

## Validation

Source-level TypeScript validation was checked with a temporary Prisma type stub in the packaging environment because Prisma binary downloads are not available there. Run the normal project commands on your machine or VPS:

```bash
npm install
npm run db:generate
npm run typecheck
npm run build
```

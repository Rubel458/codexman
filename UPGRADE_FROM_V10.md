# Upgrade from V10 to V11

V11 adds UI cleanup, separate header/footer branding, a dynamic Global Platforms section, four independent About-detail pages and private visitor analytics.

## Preserve the existing PostgreSQL volume

Do **not** run `docker compose down -v`. It removes the database volume.

## Upgrade steps

1. Extract V11 into a new folder.
2. Copy the existing `.env` file from the V10 installation.
3. Add a long random analytics salt:

```env
ANALYTICS_HASH_SECRET="replace-with-a-long-random-analytics-secret"
```

4. Install and migrate:

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

## Database migration

V11 applies:

```text
prisma/migrations/20260614143000_ui_cms_analytics/migration.sql
```

It adds the `PLATFORMS` homepage section, makes the removed contact lead identity fields nullable for backward compatibility and creates the private `VisitorDaily` analytics table.

## CMS routes added

```text
/admin/home/platforms
/admin/analytics
/admin/page-content/our-mission
/admin/page-content/our-vision
/admin/page-content/our-philosophy
/admin/page-content/our-strategy
```

## Notes

The homepage form intentionally stores only the visitor message and an internal abuse-prevention fingerprint. Existing lead records remain readable.

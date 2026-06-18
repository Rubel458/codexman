# Upgrade from V8 to V9

V9 adds notifications, revocable admin sessions, logo management and additional CMS controls without deleting existing content.

## Safe upgrade steps

Back up your database and keep your existing `.env` file. Extract V9 into a new folder, copy `.env`, then run:

```powershell
npm config set registry https://registry.npmjs.org/
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run dev
```

Never run this command on a working database:

```powershell
docker compose down -v
```

## New migrations

```text
20260613190000_notifications
20260613193000_admin_session_version
```

They add:

- A reusable `Notification` table for admin alerts.
- A `sessionVersion` field on the admin account so password resets revoke old sessions.

## New CMS controls

### About cards

Open:

```text
/admin/home/about
```

Each card supports image, title, overlay text and destination URL.

### Service icon images

Open:

```text
/admin/services
```

Each service supports a fallback Lucide icon plus an optional uploaded SVG, PNG, JPG or WebP custom icon image.

### Testimonials per row

Open:

```text
/admin/home/testimonials
```

Set **Testimonials displayed at once** to `1`, `2`, `3` or another suitable value.

### Header and footer logos

Open:

```text
/admin/branding
```

Choose either:

- Text logo and website name
- Uploaded image logo

The same setting updates both the header and footer.

## Safe seeding behavior

V9 keeps:

```ts
import 'dotenv/config'
```

at the top of `prisma/seed.ts`.

The seed process now creates missing records and backfills new optional fields without overwriting content already edited in the CMS. Existing admin passwords are also preserved unless you deliberately set:

```env
ADMIN_FORCE_PASSWORD_SYNC="true"
```

Use that option only for an intentional one-time password synchronization.

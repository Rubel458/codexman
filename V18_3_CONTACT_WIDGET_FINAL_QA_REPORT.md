# IT Lab BD CMS V18.3 — Contact Widget & Final Stabilization Notes

## Added

- Added a lightweight floating contact widget on public pages.
- Added Admin Panel settings page: **Website → Floating Contact**.
- Settings are stored in the existing `Settings` table under the `contact_widget` group.
- Supported contact methods:
  - WhatsApp number
  - WhatsApp display text
  - Default WhatsApp message
  - Messenger URL
  - Phone number
  - Enable/disable per method
  - Enable/disable entire widget

## Performance / Timeout Stabilization

- Increased safe CMS query timeout defaults from 1.5s to 4s.
- Added separate fast SEO metadata timeout: `CMS_SEO_QUERY_TIMEOUT_MS=1200`.
- Increased CMS cache TTL from 10s to 60s.
- Increased fallback cache TTL from 5s to 15s.
- Suppressed noisy CMS timeout console errors unless `CMS_DEBUG_TIMING=true` is explicitly enabled.
- Added public CMS read indexes for menu, settings, pages, homepage sections, services, portfolio, demos, testimonials, logos and media.

## Media / Download Safety

- Uploaded images remain stored in persistent storage via `UPLOAD_DIR` / Docker volume.
- Download files remain stored in persistent storage via `DOWNLOAD_DIR` / Docker volume.
- Upload delivery route now streams persistent uploaded files instead of reading the full image into memory.
- Download file upload avoids creating an extra full-size Buffer copy before writing the file.
- Download API already streams files to visitors and increments download count safely.

## Security Review Fixes

- Floating contact settings API requires admin session.
- Floating contact settings API requires CSRF token.
- Floating contact settings API checks trusted origin.
- Floating contact settings API is rate limited.
- Messenger URL is validated via the existing safe URL sanitizer.
- WhatsApp/phone values are displayed as links only after safe normalization.
- Upload/download file extension restrictions remain active.
- SVG uploads remain disabled for uploaded media.

## SEO / Production URL Review

- Existing sitemap and robots logic continue using `NEXT_PUBLIC_SITE_URL` / `SITE_URL`.
- Production fallback remains `https://itlabbd.com`.
- Localhost appears only in local-development fallback/example values.
- No new localhost hardcoding was added.

## Deployment Notes

Run in production after upload/redeploy:

```bash
npm run db:deploy
npm run build
```

For Dokploy/Docker, normal redeploy is enough if the container still runs:

```bash
npx prisma migrate deploy && npm run start
```

Never run:

```bash
docker compose down -v
```

That command can delete Docker volumes and therefore uploaded media, downloads, backups and database data.

## Validation Note

A full `npm run build` could not be completed inside the sandbox because dependency installation timed out in the container environment. The code changes are intentionally small and isolated, but please run `npm run db:deploy && npm run build` once locally or on the server before the final production switch.

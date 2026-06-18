# Upgrade from V7 to V8

V8 adds complete CMS controls for homepage blocks, improves mobile navigation and changes admin password recovery to an email-based flow.

## Safe upgrade steps

Back up your database and preserve `.env`, then run:

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
npm run dev
```

Do **not** run `docker compose down -v` on an existing working database.

## New environment value

Set the administrator email used by the reset-password system:

```env
ADMIN_EMAIL="info@itlabbd.com"
```

SMTP must also be configured for reset emails to leave the application.

## New migration

`20260613010000_cms_content_controls` adds:

- Portfolio homepage button label and URL
- Testimonial brand logo URL
- Testimonial client image URL
- Testimonial client position

## Forgot-password fix

The forgot-password form now stores the form reference before awaiting the CSRF token, preventing the browser runtime error caused by constructing `FormData` from an invalid target after an asynchronous boundary.

# IT Lab BD production checklist

## Before launch

- [ ] Copy `.env.example` to `.env` and replace every example credential.
- [ ] Generate a strong bcrypt admin password hash and remove the plain development password.
- [ ] Use a long random `SESSION_SECRET`.
- [ ] Keep `ALLOW_ENV_AUTH_FALLBACK="false"` in production.
- [ ] Keep `ALLOW_ADMIN_RESTORE="false"` except during a controlled maintenance window.
- [ ] Configure Redis, SMTP and the real public site URL.
- [ ] Apply Prisma migrations and run the backend health check.
- [ ] Run `npm audit` and `npm run build` on the deployment machine.
- [ ] Configure Nginx, HTTPS and forced HTTP-to-HTTPS redirects.
- [ ] Restrict the firewall to SSH, HTTP and HTTPS.
- [ ] Confirm that PostgreSQL and Redis listen locally only.
- [ ] Configure Cloudflare proxied DNS, strict SSL mode, managed WAF rules and endpoint rate limits.
- [ ] Install daily, weekly and monthly backup cron jobs.
- [ ] Copy backups off the VPS using an encrypted off-site process.
- [ ] Test backup restoration on staging.

## After launch

- [ ] Review `/admin/activity-logs` regularly.
- [ ] Confirm the backup dashboard shows successful daily jobs.
- [ ] Check contact-form delivery and admin notifications.
- [ ] Upload a JPG or PNG and confirm that the frontend uses the generated WebP URL.
- [ ] Monitor server updates, dependency updates and Cloudflare events.

## V11 analytics and branding

- [ ] Set a long random `ANALYTICS_HASH_SECRET`.
- [ ] Confirm `/admin/analytics` records visits after deployment.
- [ ] Confirm analytics metrics are not rendered on public pages.
- [ ] Upload and test independent header and footer logos from `/admin/branding`.
- [ ] Configure marketplace profile links from `/admin/home/platforms`.

## Real-time CMS acceptance

- [ ] `.env` contains `CMS_CACHE_TTL_SECONDS="10"` and `CMS_FALLBACK_CACHE_TTL_SECONDS="5"`.
- [ ] Node.js service restarted after changing `.env`.
- [ ] Editing the homepage Hero creates a `[cms-invalidation] completed` log entry.
- [ ] An open public homepage tab refreshes automatically after save.
- [ ] A manual browser refresh displays saved CMS content immediately.
- [ ] Services, Portfolio, Testimonials, About, Global Platforms and Branding pass create/update/hide/delete tests.
- [ ] Cloudflare does not cache public HTML responses. Static assets may remain cached.

# ITLABBD CMS V15 - Production Acceptance Checklist

## Before launch
- [ ] Generate unique PostgreSQL superuser and application-role passwords.
- [ ] Store `.env` outside version control with mode `600`.
- [ ] Set `ALLOW_ENV_AUTH_FALLBACK="false"`.
- [ ] Set `TRUST_PROXY_HEADERS="true"` only behind the included Nginx proxy.
- [ ] Set `RATE_LIMIT_FAIL_CLOSED="true"`.
- [ ] Create `/var/lib/itlabbd/uploads` and `/var/lib/itlabbd/backups` owned by `www-data`.
- [ ] Run `NODE_ENV=production npm run prod:check`, `npm run lint`, `npm run typecheck`, `npm audit --audit-level=high` and `npm run build`.
- [ ] Install the updated systemd, Nginx and `/etc/cron.d` templates.
- [ ] Configure TLS and Cloudflare Full (strict).

## Functional test
- [ ] Homepage, services, portfolio, contact and sitemap open normally.
- [ ] Mission, Vision, Philosophy and Strategy CMS editors open without 404.
- [ ] Global Platforms editor saves correctly.
- [ ] Logo upload survives a release-folder switch.
- [ ] Deleting media removes the database record and stored files.
- [ ] Contact form creates a lead notification.
- [ ] Forgot-password email works.
- [ ] CMS changes become visible immediately.
- [ ] Manual backup works.
- [ ] Controlled staging restore works.
- [ ] VPS reboot restores Docker, PostgreSQL, Redis, Node and Nginx automatically.

## Post-launch
- [ ] Monitor `journalctl -u itlabbd -f`.
- [ ] Keep encrypted off-server backups.
- [ ] Do not create Cloudflare Cache Everything rules for dynamic HTML.

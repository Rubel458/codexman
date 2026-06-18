# IT Lab BD CMS security notes

V10 adds application-level controls intended for a real VPS deployment. Security is a process, not a one-time checkbox: keep the operating system, Node.js runtime and dependencies patched after launch.

## Authentication and session protection

- Password hashing with bcrypt.
- JWT admin session stored in an HTTP-only, Secure-in-production, SameSite=Strict cookie.
- Issuer and audience validation on signed sessions.
- Database-backed `sessionVersion` validation on protected requests.
- Password reset increments the session version and revokes earlier sessions.
- Environment-only fallback login disabled in production unless explicitly enabled.
- Database-backed login lock: 5 failed password attempts lock the account for 10 minutes.
- IP-based rate limiting remains active in addition to account locking.

## Request protection

- CSRF token validation for state-changing admin and authentication actions.
- Same-origin validation.
- Rate limits for login, password reset, lead submission, media uploads, CMS writes, replies and backups.
- Request-body size limits.
- Resource allowlists and field allowlists to prevent mass assignment.
- URL protocol validation.
- Prototype-pollution key filtering.
- Zod validation on dedicated endpoints.

## Database safety

- Prisma parameterized queries are used instead of manually constructed SQL strings.
- PostgreSQL uses a dedicated application role.
- PostgreSQL is bound to `127.0.0.1:5432` in the included Compose file.
- Redis is bound to `127.0.0.1:6379`.
- Never publish database or Redis ports through the VPS firewall.

## Upload safety and WebP generation

- SVG uploads are disabled completely.
- Allowed uploads: JPG, JPEG, PNG and WebP.
- Maximum upload size: 5 MB.
- Raster binary signatures are verified before processing.
- Random filenames prevent path traversal and collisions.
- Original image is preserved.
- A resized WebP version is generated automatically through Sharp.
- CMS forms receive the optimized WebP URL.

## HTTP headers

Configured in `next.config.mjs`:

- Content-Security-Policy
- Strict-Transport-Security in production
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- X-DNS-Prefetch-Control
- Cache-Control no-store for `/admin`, `/api/admin` and `/api/auth`

## Activity log system

Open:

```text
/admin/activity-logs
```

Tracked operations include:

- Successful login
- Failed login
- Temporary login lock
- Logout
- Password reset
- CMS record creation
- CMS record update
- CMS record deletion
- Lead status change
- Lead email reply
- Branding/settings update
- Cache clear
- Media upload
- Backup creation
- Backup download
- Backup restoration
- Backup deletion

## Backup restore safety

Admin restoration is disabled by default:

```env
ALLOW_ADMIN_RESTORE="false"
```

Enable it only during a controlled maintenance window, perform the restore, verify the application, then return it to `false`.

## Production checklist

- Use HTTPS and force redirects at Nginx.
- Use Cloudflare proxied DNS, Full (strict) SSL and WAF protections.
- Replace all example secrets.
- Use a long random `SESSION_SECRET`.
- Remove plain `ADMIN_PASSWORD` from production.
- Keep `ALLOW_ENV_AUTH_FALLBACK="false"`.
- Keep `ALLOW_ADMIN_RESTORE="false"` during normal operation.
- Configure Redis and SMTP.
- Test off-site PostgreSQL backup copies and restoration procedures.
- Restrict SSH access where possible.
- Review `/admin/activity-logs` regularly.

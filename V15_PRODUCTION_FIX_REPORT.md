# ITLABBD CMS V15 - Production Fix Report

## Fixed blockers
- Analytics TypeScript release build typing corrected.
- Stale `tsconfig.tsbuildinfo` removed and ignored.
- Mission, Vision, Philosophy and Strategy CMS editor routes enabled.
- PostgreSQL and Redis Docker restart policies added.
- PostgreSQL bootstrap passwords parameterized for new volumes.

## Security hardening
- Nginx now overwrites forwarded IP headers rather than appending attacker-controlled values.
- Rate-limit fingerprinting trusts proxy headers only when explicitly enabled.
- Sensitive rate limits fail closed in production when Redis is unavailable unless explicitly disabled.
- Backup commands use a temporary mode-0600 `PGPASSFILE`; database passwords no longer appear in `pg_dump` or `pg_restore` command arguments.
- CMS resource payload validation strengthened.
- Protocol-relative URLs such as `//evil.example` are rejected.
- Media deletion removes optimized and original image files.

## Deployment hardening
- `UPLOAD_DIR` and `BACKUP_DIR` support persistent directories outside release folders.
- `/etc/cron.d` backup file format corrected.
- systemd waits for PostgreSQL readiness and starts Node on localhost only.
- Build script uses webpack for stable deterministic VPS builds.
- Working lint/preflight and CI gate added.

## Follow-up recommendation
The CSP still allows inline scripts and styles for framework compatibility. A nonce-based CSP migration should be tested in staging as a separate hardening task before removing those allowances.

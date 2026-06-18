# ITLABBD CMS V15 - Production Audit Fixes

- Fixed analytics build typing and removed stale TypeScript incremental cache from releases.
- Enabled Mission, Vision, Philosophy and Strategy CMS editors.
- Added Docker restart policies and parameterized PostgreSQL bootstrap passwords.
- Added trusted-proxy IP handling and safer Nginx forwarded headers.
- Moved media storage behind configurable `UPLOAD_DIR` and delete files when media records are removed.
- Removed database passwords from `pg_dump` and `pg_restore` command-line arguments by using temporary mode-0600 `PGPASSFILE` files.
- Added resource-specific CMS payload validation and protocol-relative URL rejection.
- Corrected `/etc/cron.d` backup template format.
- Added a working release lint preflight and a `npm run preflight` gate.
- Added homepage Organization JSON-LD and more accurate sitemap last-modified behavior.

# ITLABBD CMS V15 - Validation Notes

Validated in the packaging environment:

- `npm run lint`: passed
- `npx tsc --noEmit --incremental false`: passed
- `npm audit --audit-level=high`: passed with 0 known vulnerabilities
- `npx next build --webpack`: passed completely
- Next.js route generation: passed
- Runtime sitemap route: detected
- Runtime upload route: detected
- Four About CMS editors: enabled
- Global Platforms CMS editor: retained
- Docker restart policies: present
- Parameterized PostgreSQL init script: present
- Nginx forwarded-IP overwrite: present
- Persistent `UPLOAD_DIR` and `BACKUP_DIR`: supported
- Media filesystem deletion: implemented
- Backup `PGPASSFILE`: implemented
- Internal npm-registry URLs: absent
- `.env`: excluded from release
- `node_modules`: excluded from release
- `.next`: excluded from release
- `*.tsbuildinfo`: excluded from release

The packaging sandbox could not download Prisma engine binaries from `binaries.prisma.sh`. A temporary local Prisma type stub was used only during sandbox compilation and removed before ZIP creation. Run `npm run db:generate` on the VPS to generate the real Prisma client.

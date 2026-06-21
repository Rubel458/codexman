# V18.5 Homepage Sidebar Collapsible Update

## Scope

Targeted admin sidebar navigation refinement only.

## Changed

- Grouped all existing homepage section links under one collapsible `Homepage` parent item.
- Reused the existing expandable sidebar behavior already used by Operations, Downloads, Blog, Portfolio, Demo, and About.
- Homepage submenu now expands/collapses on click.
- Parent active state and submenu active state are handled by the existing `NavItem` logic.
- No database migration required.
- No frontend public website changes.
- No admin feature logic changes.

## Homepage submenu structure

- Hero Section
- About Section
- Counter Section
- Services Section
- Global Platforms
- What We Do
- Portfolio Section
- Testimonials Section
- Trusted Companies
- Contact Section

## Validation Notes

- Only `components/admin/admin-shell.tsx` was changed.
- No Prisma schema changes.
- No database seed changes.
- No route changes.
- Existing `/admin/home/[section]` URLs are preserved.

## Deploy

Run:

```bash
npm run build
```

For Docker/Dokploy, redeploy normally.

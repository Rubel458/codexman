# V18.6 Dynamic Footer, Header Settings & Scroll Reveal

## Scope
This update adds a production-safe dynamic footer management system, makes remaining header CTA text dynamic, and adds lightweight site-wide scroll reveal animations.

## Added

### Footer Management
- New admin route: `/admin/footer-settings`
- New API route: `/api/admin/footer-settings`
- Footer settings are stored in the existing `Settings` table using group `footer`.
- No Prisma schema change is required.
- No database migration is required.

Manageable footer fields:
- About section title and description
- Footer logo mode and footer logo image
- Quick Links title and links
- Additional/Resource Links title and links
- Contact title, phone, email, address and labels
- Newsletter title, description, placeholder and button text
- Copyright text
- Social media links

### Footer Design
- Replaced the fixed footer with a dynamic premium footer inspired by the supplied reference.
- Uses refined navy/blue/purple gradients instead of an overly dark flat footer.
- Supports two link columns, contact block, social icons, newsletter strip and centered copyright.

### Header Dynamic Settings
Added to existing Header/Branding settings:
- Header info text
- Header button text
- Header button URL

These replace previously hardcoded values such as `Have Any Questions?` and `DEMOS`.

### Scroll Reveal Animation
- Added lightweight scroll reveal across public pages.
- Header, sections and footer animate when entering viewport.
- Respects `prefers-reduced-motion`.
- No heavy GSAP dependency was added, avoiding bundle-size risk.

## Production Notes
Run after replacing files:

```bash
npm run build
```

No DB migration is required for this update.

## Cache / Real-Time Note
Footer and header settings use existing CMS cache invalidation. Saving footer/header settings triggers CMS cache clear and Next.js revalidation through the existing invalidation layer.

# V18.2 Download & Blog Refinements

This update keeps the existing production structure and only refines the requested Download and Blog modules.

## Download module

- Removed automatic/default download categories through a new migration cleanup.
- Existing user-created categories are not touched.
- Added dynamic category management through Admin > Downloads > Categories.
- Organized Admin navigation with Downloads submenus:
  - Categories
  - Download Files
- Added dedicated download details pages at `/downloads/[slug]`.
- Download listing cards now include:
  - Live Preview
  - Download
  - Details
- Added additional information field for download detail pages.
- Added sidebar promotional banner support for download details pages through Admin > Sidebar Banners.
- Download file serving now streams files instead of reading the full file into memory.

## Blog module

- Added Blog Categories management through Admin > Blog > Categories.
- Organized Admin navigation with Blog submenus:
  - Categories
  - Posts
- Added Blog details sidebar sections:
  - Blog Categories
  - Archives
  - Recent Posts
  - Promotional Banner
- Blog sidebar promotional banner is manageable from Admin > Sidebar Banners.

## Database migration

New migration:

```text
prisma/migrations/20260621174500_download_blog_refinements/migration.sql
```

This migration:

- Adds `DownloadItem.additionalInfo`.
- Adds `BlogCategory`.
- Adds optional `BlogPost.categoryId`.
- Adds `PromoBanner`.
- Removes only the deterministic default download categories inserted by the previous migration.

## Production command

Use the normal safe production command:

```bash
npm run db:deploy
npm run build
```

For Dokploy/Docker, redeploy normally if your Docker start command already runs `npm run db:deploy`.

# V18.1 Production-Safe Media Persistence + New Modules

## Critical fixes

### Uploaded images survive redeploys
- Upload storage now defaults to `storage/uploads` instead of `public/uploads`.
- Production `docker-compose-server.yml` mounts a named Docker volume at `/app/storage/uploads`.
- Database URLs stay the same (`/uploads/<filename>`), but files are now stored outside the rebuilt app image.

### Download files survive redeploys
- New download files are stored in `/app/storage/downloads`.
- Production `docker-compose-server.yml` mounts a named Docker volume at that path.

### Backups survive redeploys
- `BACKUP_DIR` is mounted to `/app/storage/backups`.

### Safer image uploads
- Upload rate limit is now configurable with `ADMIN_UPLOAD_LIMIT_PER_HOUR` and defaults to `250` per hour per admin.
- Sharp memory usage is reduced with disabled cache and single-worker image processing.
- Large image decompression is protected with `MAX_IMAGE_INPUT_PIXELS`.
- Image size is configurable with `MAX_IMAGE_UPLOAD_BYTES`.

### Sitemap / canonical URL fix
- Sitemap, robots and metadata now use `getSiteUrl()`.
- Production fallback is `https://itlabbd.com` instead of localhost when `NEXT_PUBLIC_SITE_URL` is missing.
- Set `NEXT_PUBLIC_SITE_URL=https://itlabbd.com` in production.

## New modules

### Free Downloads
Frontend route: `/downloads`
Admin routes:
- `/admin/download-items`
- `/admin/download-categories`

Supports thumbnail, title, description, category, file upload, live preview URL, active status and download counter.

### Gallery
Frontend route: `/gallery`
Admin route: `/admin/gallery-items`

Responsive grid with lightbox popup.

### Blog
Frontend routes:
- `/blog`
- `/blog/[slug]`

Admin route:
- `/admin/blog-posts`

Blog posts are not shown on the homepage.

## Deployment note

Never run `docker compose down -v` in production. That deletes named volumes and will remove PostgreSQL data, uploads, downloads and backups.

If old uploaded files still exist in a previous release folder or old container, copy them into the new upload volume before or immediately after deployment.

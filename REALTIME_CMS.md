# Real-time CMS update mode

V14 makes public CMS changes visible immediately after an administrator saves content.

## What changed

- Public CMS pages use `dynamic = "force-dynamic"` and `revalidate = 0`.
- CMS application-cache TTL defaults to 10 seconds instead of 300 seconds.
- Fallback CMS cache TTL defaults to 5 seconds.
- Every CMS create, update, delete and branding save calls the shared `invalidateCmsCache()` helper.
- `invalidateCmsCache()` removes Redis and memory keys beginning with `cms:` and calls `revalidatePath("/", "layout")`.
- CMS API responses confirm `committed: true` and include cache-invalidation details.
- Admin editors call `router.refresh()` after successful saves.
- A browser-tab update signal refreshes open public pages automatically after a CMS save.
- Public HTML pages send `Cache-Control: no-store, max-age=0, must-revalidate` so a browser or proxy should not reuse stale HTML.

## Environment variables

```env
CMS_CACHE_DISABLED="false"
CMS_CACHE_TTL_SECONDS="10"
CMS_FALLBACK_CACHE_TTL_SECONDS="5"
```

For a strict zero-cache debugging session:

```env
CMS_CACHE_DISABLED="true"
```

Restart the Node.js process after changing environment variables.

## Server logs

Each CMS write now prints a concise server-side purge result:

```text
[cms-invalidation] completed {
  redisDeleted: 4,
  memoryDeleted: 0,
  cacheDisabled: false,
  reason: 'update:homepage-sections:...',
  nextCacheInvalidated: true,
  invalidatedAt: '...'
}
```

## Acceptance test

1. Open the homepage in one browser tab.
2. Open `/admin/home/hero` in a second tab.
3. Change the headline and click **Save changes**.
4. Confirm that the API response is successful and the server prints `[cms-invalidation] completed`.
5. Return to the public tab. It should refresh automatically. A manual reload must also show the new text immediately.
6. Repeat with Services, Portfolio, Testimonials, About, Global Platforms and Branding.
7. Test create, update, enable/disable and delete operations from the generic resource managers.

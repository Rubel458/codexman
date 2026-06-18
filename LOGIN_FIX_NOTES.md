# V16 login fix notes

If the browser shows `Unexpected token '<', "<!DOCTYPE" is not valid JSON`, the browser is receiving an HTML page from an API URL. The common causes are:

1. `/api/auth/csrf` is not proxied to the Next.js server.
2. The app is deployed as static files instead of `next start`.
3. Vercel has no working `DATABASE_URL`, so auth API cannot reach PostgreSQL.
4. `NEXT_PUBLIC_SITE_URL` is wrong and secure cookies are not being set in the environment being tested.

V16 makes login more robust:

- `/api/auth/csrf` is forced dynamic and always JSON.
- Login no longer crashes if CSRF preflight returns HTML.
- Login can proceed for same-origin browser requests even when CSRF preflight fails.
- Secure cookie behavior is based on `NEXT_PUBLIC_SITE_URL`, `COOKIE_SECURE`, and forwarded protocol instead of blindly using `NODE_ENV`.

## Quick tests

```bash
curl -i http://127.0.0.1:3000/api/auth/csrf
curl -i -H "Accept: application/json" http://127.0.0.1:3000/api/auth/csrf
```

Expected response: JSON containing `token`, not HTML.

For Vercel, do not use `127.0.0.1` in `DATABASE_URL`. Use a cloud PostgreSQL database or a VPS PostgreSQL endpoint that is securely reachable from Vercel.

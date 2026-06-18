# Cloudflare baseline for IT Lab BD

Use proxied DNS records for the public domain and keep SSL/TLS mode on **Full (strict)** after the origin certificate is installed.

Recommended starting rules:

1. Enable the managed WAF ruleset available for the account plan.
2. Apply a rate-limiting rule to `/api/auth/login`.
3. Apply a rate-limiting rule to `/api/auth/forgot-password`.
4. Apply a rate-limiting rule to `/api/contact`.
5. Challenge obviously automated traffic hitting `/admin/login` repeatedly.
6. Keep PostgreSQL `5432` and Redis `6379` outside the public firewall entirely.

Cloudflare adds an outer layer. Application-level CSRF, authentication, validation and rate limits must remain enabled.

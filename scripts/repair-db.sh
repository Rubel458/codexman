#!/usr/bin/env sh
set -eu
printf '%s\n' "Repairing local PostgreSQL permissions..."
if docker compose exec -T postgres psql -U postgres -d itlabbd -f /docker-entrypoint-initdb.d/001-permissions.sql; then
  printf '%s\n' "PostgreSQL permissions repaired with database administrator role: postgres"
elif docker compose exec -T postgres psql -U itlabbd -d itlabbd -f /docker-entrypoint-initdb.d/001-permissions.sql; then
  printf '%s\n' "PostgreSQL permissions repaired with database administrator role: itlabbd"
else
  printf '%s\n' "Database permission repair failed. For a disposable local database run: docker compose down -v ; docker compose up -d" >&2
  exit 1
fi

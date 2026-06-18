#!/bin/sh
set -eu
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=app_password="$APP_DB_PASSWORD" <<'EOSQL'
SELECT 'CREATE ROLE itlabbd LOGIN PASSWORD ' || quote_literal(:'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'itlabbd')\gexec
SELECT 'ALTER ROLE itlabbd WITH LOGIN PASSWORD ' || quote_literal(:'app_password')\gexec
SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO itlabbd', current_database())\gexec
ALTER SCHEMA public OWNER TO itlabbd;
GRANT USAGE, CREATE ON SCHEMA public TO itlabbd;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO itlabbd;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO itlabbd;
EOSQL

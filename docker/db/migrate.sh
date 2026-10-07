#!/bin/sh
# Applies supabase/migrations/*.sql in order, each once, inside a transaction.
# Seeds supabase/seed.sql the first time any migration is applied, or whenever
# SEED=1 (the seed file is idempotent).
set -eu

psql() { command psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

psql -c "CREATE SCHEMA IF NOT EXISTS supabase_migrations;
  CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY, statements text[], name text);"

fresh=$(psql -tAc "SELECT count(*) = 0 FROM supabase_migrations.schema_migrations")
applied=0

for file in $(ls /migrations/*.sql 2>/dev/null | sort); do
  base=$(basename "$file" .sql)
  version=${base%%_*}
  name=${base#*_}
  done=$(psql -tAc "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '$version'")
  [ -n "$done" ] && continue
  echo "Applying $base"
  { cat "$file"; echo; echo "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$version', '$name');"; } \
    | psql --single-transaction -f -
  applied=$((applied + 1))
done

if { [ "${SEED:-0}" = "1" ] || { [ "$fresh" = "t" ] && [ "$applied" -gt 0 ]; }; } && [ -s /seed.sql ]; then
  echo "Seeding database"
  psql --single-transaction -f /seed.sql
fi

# Let PostgREST pick up new tables and functions.
psql -c "NOTIFY pgrst, 'reload schema';"
echo "Migrations up to date ($applied applied)"

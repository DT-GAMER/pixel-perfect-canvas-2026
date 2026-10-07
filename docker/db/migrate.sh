#!/bin/sh
# Applies supabase/migrations/*.sql in order, each once, inside a transaction.
# Seeds supabase/seed.sql the first time any migration is applied, or whenever
# SEED=1 (the seed file is idempotent).
#
# The whole run is idempotent, so a dropped connection to a remote database is
# retried from the top. Every step checks its own result explicitly (set -e is
# ignored inside functions called from a condition).
set -u

psql() { command psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

run() {
  psql -c "CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY, statements text[], name text);" || return 1

  fresh=$(psql -tAc "SELECT count(*) = 0 FROM supabase_migrations.schema_migrations") || return 1
  applied=0

  for file in $(ls /migrations/*.sql 2>/dev/null | sort); do
    base=$(basename "$file" .sql)
    version=${base%%_*}
    name=${base#*_}
    done=$(psql -tAc "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '$version'") || return 1
    [ -n "$done" ] && continue
    echo "Applying $base"
    { cat "$file"; echo; echo "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$version', '$name');"; } \
      | psql --single-transaction -f - || return 1
    applied=$((applied + 1))
  done

  if { [ "${SEED:-0}" = "1" ] || { [ "$fresh" = "t" ] && [ "$applied" -gt 0 ]; }; } && [ -s /seed.sql ]; then
    echo "Seeding database"
    psql --single-transaction -f /seed.sql || return 1
  fi

  # Let PostgREST pick up new tables and functions.
  psql -c "NOTIFY pgrst, 'reload schema';" || return 1
  echo "Migrations up to date ($applied applied)"
}

for attempt in 1 2 3 4 5; do
  until pg_isready -d "$DATABASE_URL" -q; do sleep 2; done
  run && exit 0
  echo "Migration attempt $attempt failed; retrying in 5s" >&2
  sleep 5
done
echo "Migrations failed after 5 attempts" >&2
exit 1

# Database tools image: bootstrap + migrations + seed, baked in (no bind mounts,
# which some hosts such as Coolify don't support for single files).
# Build from the repository root: docker build -f docker/db/Dockerfile .
FROM postgres:17-alpine
COPY docker/db/bootstrap.sql /bootstrap.sql
COPY docker/db/migrate.sh /scripts/migrate.sh
COPY supabase/migrations /migrations
COPY supabase/seed.sql /seed.sql
ENTRYPOINT ["sh", "/scripts/migrate.sh"]

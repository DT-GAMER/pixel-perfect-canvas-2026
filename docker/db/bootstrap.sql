-- Prepares any PostgreSQL server (15+) for the Supabase services in docker-compose.yml:
-- the API roles, and the login roles + schemas that Auth (GoTrue) and Storage own.
-- Idempotent: safe to run on every `docker compose up`.
--
-- Run as a superuser with psql, passing the service password:
--   psql "$DATABASE_URL" -v svc_pass="$DB_SERVICE_PASSWORD" -f bootstrap.sql

\set ON_ERROR_STOP on

-- API roles used by PostgREST/Storage when acting for a request.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  -- PostgREST connects as authenticator, then switches to one of the roles above.
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator LOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE;
  END IF;
END
$$;

-- Service logins share DB_SERVICE_PASSWORD (never the superuser's password).
SELECT format('ALTER ROLE %I WITH PASSWORD %L', role, :'svc_pass')
FROM unnest(ARRAY['authenticator', 'supabase_auth_admin', 'supabase_storage_admin']) AS role
\gexec

GRANT anon, authenticated, service_role TO authenticator;
-- Storage switches to the request's role inside its own connection.
GRANT anon, authenticated, service_role TO supabase_storage_admin;

-- Auth and Storage run their own migrations, which need to create objects in the database.
SELECT format('GRANT CREATE, CONNECT, TEMPORARY ON DATABASE %I TO supabase_auth_admin, supabase_storage_admin', current_database())
\gexec

-- Auth and Storage manage their own schemas and run their own migrations there.
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
ALTER ROLE supabase_auth_admin SET search_path = auth;
ALTER ROLE supabase_storage_admin SET search_path = storage;
GRANT USAGE ON SCHEMA auth, storage TO anon, authenticated, service_role;

-- App tables live in public; migrations grant table access explicitly.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

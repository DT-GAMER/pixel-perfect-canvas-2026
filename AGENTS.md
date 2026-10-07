## Architecture rules

- Keep homepage content and interactions in focused site components; the index route only composes the page and owns its metadata. This keeps the route readable as later phases replace placeholders with managed data.
- Mount cross-site registration once in the root layout and open it through shared register triggers. This keeps one accessible form and one submission flow across every page.
- Run locally with Docker Compose (see README). Schema changes go in new files under `supabase/migrations/`; never edit an applied migration.

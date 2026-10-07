import { createFileRoute } from "@tanstack/react-router";

// Liveness check for Docker/Coolify. Doesn't touch the database.
export const Route = createFileRoute("/healthz")({
  server: {
    handlers: { GET: () => new Response("ok", { headers: { "cache-control": "no-store" } }) },
  },
});

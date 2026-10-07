import { createFileRoute } from "@tanstack/react-router";

// Only files the dashboard uploader creates: <folder>/<uuid>.<ext>
const PATH = /^(sponsors|speakers|blog)\/[0-9a-f-]{36}\.(png|jpg|gif|webp|svg)$/;

// GET /media/<path>: serves uploaded images from the app's own domain, so the
// storage API never needs to be public. File names are unique, so cache forever.
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!PATH.test(path)) return new Response("Not found", { status: 404 });
        const base = (process.env["SUPABASE_URL"] ?? "").replace(/\/$/, "");
        const upstream = await fetch(`${base}/storage/v1/object/public/media/${path}`);
        if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
        const headers = new Headers({
          "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
          "cache-control": "public, max-age=31536000, immutable",
          "x-content-type-options": "nosniff",
        });
        const length = upstream.headers.get("content-length");
        if (length) headers.set("content-length", length);
        // SVGs opened directly can't run scripts or load anything.
        if (path.endsWith(".svg"))
          headers.set(
            "content-security-policy",
            "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          );
        return new Response(upstream.body, { headers });
      },
    },
  },
});

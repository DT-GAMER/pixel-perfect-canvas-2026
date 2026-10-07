import { createFileRoute } from "@tanstack/react-router";

// GET /robots.txt: allow the public site, keep crawlers out of the dashboard.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { siteUrl } = await import("@/lib/site-url.server");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /auth/",
          "",
          `Sitemap: ${siteUrl()}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

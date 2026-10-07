import { createFileRoute } from "@tanstack/react-router";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/speakers", priority: "0.8", changefreq: "daily" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/sponsors", priority: "0.7", changefreq: "weekly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
];

// GET /sitemap.xml: public pages plus every live blog post.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { siteUrl } = await import("@/lib/site-url.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const site = siteUrl();
        const { data: posts, error } = await supabaseAdmin
          .from("blog_posts")
          .select("slug, updated_at")
          .in("status", ["published", "scheduled"])
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false });
        if (error) return new Response("Sitemap unavailable", { status: 503 });

        const url = (loc: string, extra: string) => `  <url><loc>${site}${loc}</loc>${extra}</url>`;
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...STATIC_PAGES.map((page) =>
            url(
              page.path,
              `<changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority>`,
            ),
          ),
          ...posts.map((post) =>
            url(
              `/blog/${post.slug}`,
              `<lastmod>${post.updated_at.slice(0, 10)}</lastmod><priority>0.6</priority>`,
            ),
          ),
          "</urlset>",
          "",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

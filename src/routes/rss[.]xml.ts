import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

// RSS 2.0 feed of live posts. Title, excerpt, cover and link only: never the article body.
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { siteUrl } = await import("@/lib/site-url.server");
        const site = siteUrl();
        const absolute = (url: string) => (url.startsWith("http") ? url : `${site}${url}`);

        const { data: posts, error } = await supabaseAdmin
          .from("blog_posts")
          .select(
            "slug, title, excerpt, cover_image_url, author_name, published_at, category:categories(name)",
          )
          .in("status", ["published", "scheduled"])
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false })
          .limit(50);
        if (error) {
          console.error("RSS query failed", error.message);
          return new Response("Feed unavailable", { status: 503 });
        }

        const items = posts.map((post) => {
          const link = `${site}/blog/${post.slug}`;
          return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <dc:creator>${escapeXml(post.author_name)}</dc:creator>
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ""}
      <pubDate>${new Date(post.published_at ?? Date.now()).toUTCString()}</pubDate>
      ${post.cover_image_url ? `<media:content url="${escapeXml(absolute(post.cover_image_url))}" medium="image" />` : ""}
    </item>`;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(`${EVENT.name} blog`)}</title>
    <link>${site}/blog</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Ideas on ${EVENT.theme}`)}</description>
    <language>en</language>
${items.join("\n")}
  </channel>
</rss>
`;
        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=600",
          },
        });
      },
    },
  },
});

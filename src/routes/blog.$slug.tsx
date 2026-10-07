import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { BlogPost } from "@/components/blog/BlogPost";
import { getPost } from "@/lib/blog.functions";
import { EVENT } from "@/lib/event";

export const Route = createFileRoute("/blog/$slug")({
  validateSearch: z.object({ signin: z.string().optional().catch(undefined) }),
  loader: ({ params }) => getPost({ data: { slug: params.slug } }),
  head: ({ loaderData: post, params }) => {
    if (!post) return { meta: [{ title: `Article not found — ${EVENT.name}` }] };
    const title = post.seoTitle ?? post.title;
    const description = post.seoDescription ?? post.excerpt;
    return {
      meta: [
        { title: `${title} — ${EVENT.name}` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.publishedAt },
        ...(post.coverImageUrl ? [{ property: "og:image", content: post.coverImageUrl }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
    };
  },
  component: BlogPostRoute,
  notFoundComponent: () => (
    <section className="bg-light-grey">
      <div className="mx-auto max-w-3xl px-5 py-24">
        <h1 className="text-h1 text-deep-blue">Article not found.</h1>
        <p className="mt-4 text-muted-foreground">It may have moved, or isn't published yet.</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex min-h-12 items-center font-display font-bold text-deep-blue underline underline-offset-4"
        >
          Browse all articles
        </Link>
      </div>
    </section>
  ),
});

function BlogPostRoute() {
  const post = Route.useLoaderData();
  const { signin } = Route.useSearch();
  return <BlogPost post={post} linkExpired={signin === "expired"} />;
}

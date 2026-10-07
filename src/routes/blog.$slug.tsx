import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { BlogPost } from "@/components/blog/BlogPost";
import { getPost } from "@/lib/blog.functions";
import { absoluteUrl, EVENT } from "@/lib/event";
import { jsonLd, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  validateSearch: z.object({ signin: z.string().optional().catch(undefined) }),
  loader: ({ params }) => getPost({ data: { slug: params.slug } }),
  head: ({ loaderData: post, params }) => {
    if (!post)
      return {
        meta: [
          { title: `Article not found — ${EVENT.name}` },
          { name: "robots", content: "noindex" },
        ],
      };
    const title = post.seoTitle ?? post.title;
    const description = post.seoDescription ?? post.excerpt;
    const path = `/blog/${params.slug}`;
    const meta = pageMeta({
      title: `${title} — ${EVENT.name}`,
      description,
      path,
      image: post.coverImageUrl,
      ...(post.coverImageAlt ? { imageAlt: post.coverImageAlt } : {}),
      type: "article",
    });
    return {
      ...meta,
      meta: [
        ...meta.meta,
        { property: "article:published_time", content: post.publishedAt },
        ...(post.category ? [{ property: "article:section", content: post.category.name }] : []),
        ...post.tags.map((tag) => ({ property: "article:tag", content: tag })),
      ],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description,
          image: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: post.authorName },
          publisher: { "@type": "Organization", name: EVENT.name, url: absoluteUrl("/") },
          mainEntityOfPage: absoluteUrl(path),
          isAccessibleForFree: post.isFree,
          keywords: post.tags.join(", ") || undefined,
        }),
      ],
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

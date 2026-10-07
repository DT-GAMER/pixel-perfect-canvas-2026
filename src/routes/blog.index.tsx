import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { listPosts } from "@/lib/blog.functions";
import { EVENT } from "@/lib/event";

const searchSchema = z.object({
  category: z.string().max(80).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).optional().catch(undefined),
});

const description = () =>
  `Explainers and opinion on what AI means for Nigerian jobs, privacy, and financial security, from ${EVENT.name}.`;

export const Route = createFileRoute("/blog/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ category: search.category, page: search.page }),
  loader: ({ deps }) =>
    listPosts({
      data: {
        ...(deps.category ? { category: deps.category } : {}),
        ...(deps.page ? { page: deps.page } : {}),
      },
    }),
  head: () => ({
    meta: [
      { title: `Blog — ${EVENT.name}` },
      { name: "description", content: description() },
      { property: "og:title", content: `Blog — ${EVENT.name}` },
      { property: "og:description", content: description() },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "/blog" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: `${EVENT.name} blog`,
        href: "/rss.xml",
      },
    ],
  }),
  component: BlogIndexRoute,
});

function BlogIndexRoute() {
  const data = Route.useLoaderData();
  return <BlogIndex {...data} />;
}

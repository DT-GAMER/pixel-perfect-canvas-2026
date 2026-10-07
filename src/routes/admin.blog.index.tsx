import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BlogAdmin } from "@/components/admin/BlogAdmin";
import { POST_STATUSES } from "@/lib/admin/blog";
import { blogDashboard } from "@/lib/admin/blog.functions";

// Editors and admins.
export const Route = createFileRoute("/admin/blog/")({
  validateSearch: z.object({
    q: z.string().max(100).optional().catch(undefined),
    status: z.enum(POST_STATUSES).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => blogDashboard({ data: deps }),
  component: BlogIndexRoute,
});

function BlogIndexRoute() {
  const { q, status } = Route.useSearch();
  return <BlogAdmin posts={Route.useLoaderData()} q={q} status={status} />;
}

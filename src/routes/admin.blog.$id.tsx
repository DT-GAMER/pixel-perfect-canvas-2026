import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/PostEditor";
import { postEditorData } from "@/lib/admin/blog.functions";

// /admin/blog/new creates a post; /admin/blog/<uuid> edits one.
export const Route = createFileRoute("/admin/blog/$id")({
  loader: ({ params }) => postEditorData({ data: params.id === "new" ? {} : { id: params.id } }),
  component: PostEditorRoute,
});

function PostEditorRoute() {
  const data = Route.useLoaderData();
  const { staff } = Route.useRouteContext();
  const { id } = Route.useParams();
  // Remount when switching posts (e.g. after creating one).
  return <PostEditor key={id} data={data} defaultAuthor={staff.fullName ?? "C8 Editorial Team"} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/admin/Overview";
import { adminOnly } from "@/lib/admin/guards";
import { adminOverview } from "@/lib/admin/overview.functions";

export const Route = createFileRoute("/admin/")({
  beforeLoad: adminOnly,
  loader: () => adminOverview(),
  component: () => <Overview data={Route.useLoaderData()} />,
});

import { createFileRoute } from "@tanstack/react-router";
import { TeamAdmin } from "@/components/admin/TeamAdmin";
import { adminOnly } from "@/lib/admin/guards";
import { teamDashboard } from "@/lib/admin/team.functions";

export const Route = createFileRoute("/admin/team")({
  beforeLoad: adminOnly,
  loader: () => teamDashboard(),
  component: TeamRoute,
});

function TeamRoute() {
  const { members, meId } = Route.useLoaderData();
  return <TeamAdmin members={members} meId={meId} />;
}

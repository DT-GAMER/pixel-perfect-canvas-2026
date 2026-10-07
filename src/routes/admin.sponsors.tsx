import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SponsorsAdmin } from "@/components/admin/SponsorsAdmin";
import { adminOnly } from "@/lib/admin/guards";
import { ENQUIRY_STATUSES } from "@/lib/admin/sponsors";
import { sponsorsDashboard } from "@/lib/admin/sponsors.functions";

export const Route = createFileRoute("/admin/sponsors")({
  validateSearch: z.object({
    tab: z.enum(["sponsors", "enquiries"]).optional().catch(undefined),
    status: z.enum(ENQUIRY_STATUSES).optional().catch(undefined),
  }),
  beforeLoad: adminOnly,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) => sponsorsDashboard({ data: deps.status ? { status: deps.status } : {} }),
  component: SponsorsRoute,
});

function SponsorsRoute() {
  const { tab, status } = Route.useSearch();
  return <SponsorsAdmin data={Route.useLoaderData()} tab={tab ?? "sponsors"} status={status} />;
}

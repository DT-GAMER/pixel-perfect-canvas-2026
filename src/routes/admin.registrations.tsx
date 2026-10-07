import { createFileRoute } from "@tanstack/react-router";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { adminOnly } from "@/lib/admin/guards";
import { registrationFiltersSchema } from "@/lib/admin/registrations";
import { listRegistrations } from "@/lib/admin/registrations.functions";

export const Route = createFileRoute("/admin/registrations")({
  validateSearch: registrationFiltersSchema,
  beforeLoad: adminOnly,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listRegistrations({ data: deps }),
  component: RegistrationsRoute,
});

function RegistrationsRoute() {
  return <RegistrationsTable data={Route.useLoaderData()} filters={Route.useSearch()} />;
}

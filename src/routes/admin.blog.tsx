import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/AdminShell";

// Placeholder until this module is built.
export const Route = createFileRoute("/admin/blog")({
  component: () => <PageHeader title="Coming next" description="This section is being built." />,
});

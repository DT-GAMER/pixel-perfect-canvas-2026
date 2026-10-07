import { createFileRoute } from "@tanstack/react-router";
import { FaqsAdmin } from "@/components/admin/FaqsAdmin";
import { adminOnly } from "@/lib/admin/guards";
import { faqsDashboard } from "@/lib/admin/faqs.functions";

export const Route = createFileRoute("/admin/faqs")({
  beforeLoad: adminOnly,
  loader: () => faqsDashboard(),
  component: () => <FaqsAdmin faqs={Route.useLoaderData()} />,
});

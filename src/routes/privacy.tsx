import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { pageMeta } from "@/lib/seo";
import { PrivacyPolicy } from "@/components/site/PrivacyPolicy";
import { getPrivacyPolicy } from "@/lib/privacy.functions";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageMeta({
      title: `Privacy policy — ${EVENT.name}`,
      description: `How ${EVENT.name} collects, uses, and protects your personal information.`,
      path: "/privacy",
    }),
  loader: () => getPrivacyPolicy(),
  component: () => <PrivacyPolicy policy={Route.useLoaderData()} />,
});

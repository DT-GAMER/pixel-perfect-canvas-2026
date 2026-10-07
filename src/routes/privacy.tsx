import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { PrivacyPolicy } from "@/components/site/PrivacyPolicy";
import { getPrivacyPolicy } from "@/lib/privacy.functions";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — C8 Tech Summit" },
      {
        name: "description",
        content: `How ${EVENT.name} collects, uses, and protects your personal information.`,
      },
      { property: "og:title", content: "Privacy policy — C8 Tech Summit" },
      {
        property: "og:description",
        content: `How ${EVENT.name} collects, uses, and protects your personal information.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  loader: () => getPrivacyPolicy(),
  component: () => <PrivacyPolicy policy={Route.useLoaderData()} />,
});

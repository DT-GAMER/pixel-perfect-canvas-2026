import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/site/PageStub";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — C8 Tech Summit" },
      { name: "description", content: "Privacy policy at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:title", content: "Privacy policy — C8 Tech Summit" },
      { property: "og:description", content: "Privacy policy at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => <PageStub title="Privacy policy" note="Policy content becomes admin-editable in Phase 6." />,
});

import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/site/PageStub";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — C8 Tech Summit" },
      { name: "description", content: "Sponsors at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:title", content: "Sponsors — C8 Tech Summit" },
      { property: "og:description", content: "Sponsors at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/sponsors" }],
  }),
  component: () => <PageStub title="Sponsors" note="Sponsor tiers and enquiry form arrive in Phase 5." />,
});

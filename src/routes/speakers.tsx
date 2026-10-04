import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/site/PageStub";

export const Route = createFileRoute("/speakers")({
  head: () => ({
    meta: [
      { title: "Speakers — C8 Tech Summit" },
      { name: "description", content: "Speakers at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:title", content: "Speakers — C8 Tech Summit" },
      { property: "og:description", content: "Speakers at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/speakers" }],
  }),
  component: () => <PageStub title="Speakers" note="Full speaker lineup arrives in Phase 5." />,
});

import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { PageStub } from "@/components/site/PageStub";

export const Route = createFileRoute("/speakers")({
  head: () => ({
    meta: [
      { title: "Speakers — C8 Tech Summit" },
      { name: "description", content: `Speakers at ${EVENT.name}, ${EVENT.dateLabel}, ${EVENT.venue.toLowerCase()}.` },
      { property: "og:title", content: "Speakers — C8 Tech Summit" },
      { property: "og:description", content: `Speakers at ${EVENT.name}, ${EVENT.dateLabel}, ${EVENT.venue.toLowerCase()}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/speakers" }],
  }),
  component: () => <PageStub title="Speakers" note="Full speaker lineup arrives in Phase 5." />,
});

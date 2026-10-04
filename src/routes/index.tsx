import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { Homepage } from "@/components/site/Homepage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${EVENT.name} — ${EVENT.tagline}` },
      { name: "description", content: `${EVENT.name}: ${EVENT.tagline}. ${EVENT.dateLabel}, ${EVENT.venue}.` },
      { property: "og:title", content: `${EVENT.name} — ${EVENT.tagline}` },
      { property: "og:description", content: `${EVENT.dateLabel}, ${EVENT.venue}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Homepage,
});

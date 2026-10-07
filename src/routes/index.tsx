import { createFileRoute } from "@tanstack/react-router";
import { EVENT, EVENT_WHEN_WHERE } from "@/lib/event";
import { Homepage } from "@/components/site/Homepage";
import { latestPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${EVENT.name} — ${EVENT.tagline}` },
      { name: "description", content: `${EVENT.name} ${EVENT.edition}: ${EVENT.theme}. ${EVENT_WHEN_WHERE}.` },
      { property: "og:title", content: `${EVENT.name} — ${EVENT.tagline}` },
      { property: "og:description", content: `${EVENT.theme}. ${EVENT_WHEN_WHERE}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: () => latestPosts(),
  component: IndexRoute,
});

function IndexRoute() {
  return <Homepage latestPosts={Route.useLoaderData()} />;
}

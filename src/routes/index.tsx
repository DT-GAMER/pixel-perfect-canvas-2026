import { createFileRoute } from "@tanstack/react-router";
import { EVENT, EVENT_WHEN_WHERE } from "@/lib/event";
import { Homepage } from "@/components/site/Homepage";
import { latestPosts } from "@/lib/blog.functions";
import { featuredSpeakers } from "@/lib/speakers.functions";
import { listSponsors } from "@/lib/sponsors.functions";
import { listFaqs } from "@/lib/faqs.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${EVENT.name} — ${EVENT.tagline}` },
      {
        name: "description",
        content: `${EVENT.name} ${EVENT.edition}: ${EVENT.theme}. ${EVENT_WHEN_WHERE}.`,
      },
      { property: "og:title", content: `${EVENT.name} — ${EVENT.tagline}` },
      { property: "og:description", content: `${EVENT.theme}. ${EVENT_WHEN_WHERE}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: async () => {
    const [posts, speakers, sponsors, faqs] = await Promise.all([
      latestPosts(),
      featuredSpeakers(),
      listSponsors(),
      listFaqs(),
    ]);
    return { posts, speakers, sponsors, faqs };
  },
  component: IndexRoute,
});

function IndexRoute() {
  const { posts, speakers, sponsors, faqs } = Route.useLoaderData();
  return <Homepage latestPosts={posts} speakers={speakers} sponsors={sponsors} faqs={faqs} />;
}

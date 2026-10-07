import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, EVENT, eventWhenWhere } from "@/lib/event";
import { DEFAULT_OG_IMAGE, jsonLd, pageMeta } from "@/lib/seo";
import { Homepage } from "@/components/site/Homepage";
import { latestPosts } from "@/lib/blog.functions";
import { featuredSpeakers } from "@/lib/speakers.functions";
import { listSponsors } from "@/lib/sponsors.functions";
import { listFaqs } from "@/lib/faqs.functions";

export const Route = createFileRoute("/")({
  head: () => {
    const online = /online|virtual/i.test(`${EVENT.venue} ${EVENT.format}`);
    return {
      ...pageMeta({
        title: `${EVENT.name} ${EVENT.edition} — ${EVENT.themeShort}`,
        description: `${EVENT.theme}. ${eventWhenWhere()}. ${EVENT.mission}`,
        path: "/",
      }),
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Event",
          name: `${EVENT.name} ${EVENT.edition}`,
          description: `${EVENT.theme}. ${EVENT.mission}`,
          startDate: EVENT.startsAt,
          endDate: EVENT.endsAt,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: online
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
          location: online
            ? { "@type": "VirtualLocation", url: absoluteUrl("/") }
            : { "@type": "Place", name: EVENT.venue },
          image: [absoluteUrl(DEFAULT_OG_IMAGE)],
          url: absoluteUrl("/"),
          organizer: {
            "@type": "Organization",
            name: EVENT.name,
            url: absoluteUrl("/"),
            email: EVENT.email,
          },
        }),
      ],
    };
  },
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

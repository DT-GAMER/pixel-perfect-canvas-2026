import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SpeakersPage } from "@/components/site/SpeakersPage";
import { EVENT } from "@/lib/event";
import { listSpeakers } from "@/lib/speakers.functions";
import { TRACKS } from "@/lib/tracks";

const trackSlugs = TRACKS.map((track) => track.slug) as [string, ...string[]];
const description = () =>
  `Speakers at ${EVENT.name} ${EVENT.edition}: voices on AI, jobs, privacy, and financial security in Nigeria. ${EVENT.dateLabel}, ${EVENT.venue.toLowerCase()}.`;

export const Route = createFileRoute("/speakers")({
  validateSearch: z.object({ track: z.enum(trackSlugs).optional().catch(undefined) }),
  loader: () => listSpeakers(),
  head: () => ({
    meta: [
      { title: `Speakers — ${EVENT.name}` },
      { name: "description", content: description() },
      { property: "og:title", content: `Speakers — ${EVENT.name}` },
      { property: "og:description", content: description() },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/speakers" }],
  }),
  component: SpeakersRoute,
});

function SpeakersRoute() {
  const speakers = Route.useLoaderData();
  const { track } = Route.useSearch();
  return <SpeakersPage speakers={speakers} track={track ?? null} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SponsorsPage } from "@/components/site/SponsorsPage";
import { EVENT } from "@/lib/event";
import { listSponsors } from "@/lib/sponsors.functions";
import { ENQUIRY_TIERS } from "@/lib/sponsorship";

const description = `Sponsor ${EVENT.name} ${EVENT.edition} and reach Nigeria's tech community. Partnership tiers from headline to community and media partners.`;

export const Route = createFileRoute("/sponsors")({
  // ?tier=gold preselects the tier in the enquiry form.
  validateSearch: z.object({ tier: z.enum(ENQUIRY_TIERS).optional().catch(undefined) }),
  loader: () => listSponsors(),
  head: () => ({
    meta: [
      { title: `Sponsors & partners — ${EVENT.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `Sponsor ${EVENT.name}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/sponsors" }],
  }),
  component: SponsorsRoute,
});

function SponsorsRoute() {
  const sponsors = Route.useLoaderData();
  const { tier } = Route.useSearch();
  return <SponsorsPage sponsors={sponsors} enquiryTier={tier} />;
}

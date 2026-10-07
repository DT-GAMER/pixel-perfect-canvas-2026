import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SponsorsPage } from "@/components/site/SponsorsPage";
import { EVENT } from "@/lib/event";
import { pageMeta } from "@/lib/seo";
import { listSponsors } from "@/lib/sponsors.functions";
import { ENQUIRY_TIERS } from "@/lib/sponsorship";

const description = () =>
  `Sponsor ${EVENT.name} ${EVENT.edition} and reach Nigeria's tech community. Partnership tiers from headline to community and media partners.`;

export const Route = createFileRoute("/sponsors")({
  // ?tier=gold preselects the tier in the enquiry form.
  validateSearch: z.object({ tier: z.enum(ENQUIRY_TIERS).optional().catch(undefined) }),
  loader: () => listSponsors(),
  head: () =>
    pageMeta({
      title: `Sponsors & partners — ${EVENT.name}`,
      description: description(),
      path: "/sponsors",
    }),
  component: SponsorsRoute,
});

function SponsorsRoute() {
  const sponsors = Route.useLoaderData();
  const { tier } = Route.useSearch();
  return <SponsorsPage sponsors={sponsors} enquiryTier={tier} />;
}

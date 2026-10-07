import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Handshake, Megaphone, Users } from "lucide-react";
import { EVENT } from "@/lib/event";
import type { Sponsor } from "@/lib/sponsors.functions";
import { SPONSOR_TIERS, type TierSlug } from "@/lib/sponsorship";
import { Arcs } from "./Logo";
import { SponsorEnquiryForm } from "./SponsorEnquiryForm";
import { SponsorLogo } from "./SponsorLogo";

// From the 2026 campaign plan. Labelled as targets, not results.
const TARGETS = [
  { value: "500+", label: "Registrations" },
  { value: "200+", label: "Live attendees" },
  { value: "40,000+", label: "Campaign impressions" },
  { value: "1,000+", label: "Community leads" },
];

const REASONS = [
  {
    icon: Users,
    title: "Reach Nigeria's tech community",
    body: "Founders, engineers, product people, marketers, students, and investors: emerging talent alongside established leaders, in one room.",
  },
  {
    icon: Megaphone,
    title: "Own a timely conversation",
    body: "Align your brand with Nigeria's AI conversation: what AI means for jobs, privacy, and financial security.",
  },
  {
    icon: Handshake,
    title: "Back the next generation",
    body: "C8 gives emerging voices a seat at the table. Partners build goodwill with the people who will shape the industry next.",
  },
];

type Props = { sponsors: Sponsor[]; enquiryTier?: TierSlug | "not-sure" | undefined };

export function SponsorsPage({ sponsors, enquiryTier }: Props) {
  const byTier = (slug: string) => sponsors.filter((sponsor) => sponsor.tier === slug);
  const openTiers = SPONSOR_TIERS.filter((tier) => byTier(tier.slug).length === 0);

  return (
    <>
      <section className="relative overflow-hidden bg-deep-blue py-20 text-paper md:py-28">
        <Arcs className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase text-digital-lime">
            Sponsors & partners
          </p>
          <h1 className="mt-4 max-w-4xl text-h1">Back the builders shaping Nigeria's AI future.</h1>
          <p className="mt-6 max-w-2xl text-lg text-paper/80">
            Partner with {EVENT.name} {EVENT.edition}, {EVENT.venue.toLowerCase()} on {EVENT.dateLabel}, and put
            your brand at the centre of the conversation on AI, jobs, privacy, and financial
            security.
          </p>
          <a
            href="#enquire"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-signal-orange px-7 font-display font-bold text-deep-blue transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Enquire about sponsorship <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section aria-labelledby="why-sponsor" className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase text-digital-teal">
            Why sponsor us
          </p>
          <h2 id="why-sponsor" className="mt-3 max-w-3xl text-h2 text-deep-blue">
            A focused audience and a conversation that matters.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {REASONS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="reveal">
                <Icon className="h-10 w-10 text-signal-orange" aria-hidden="true" />
                <h3 className="mt-5 text-h3 text-deep-blue">{title}</h3>
                <p className="mt-3 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 rounded-md bg-deep-blue p-8 text-paper md:p-10">
            <p className="font-display text-sm font-bold uppercase text-digital-lime">
              {EVENT.edition} campaign targets
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
              {TARGETS.map((target) => (
                <div key={target.label}>
                  <dt className="text-paper/70">{target.label}</dt>
                  <dd className="mt-1 font-display text-4xl font-bold text-digital-lime md:text-5xl">
                    {target.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="partners" className="bg-light-grey py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase text-digital-teal">Our partners</p>
          <h2 id="partners" className="mt-3 text-h2 text-deep-blue">
            {sponsors.length ? "Thank you to our partners." : "Partner slots are open."}
          </h2>
          <div className="mt-12 space-y-14">
            {SPONSOR_TIERS.filter((tier) => byTier(tier.slug).length > 0).map((tier) => (
              <TierSection key={tier.slug} tier={tier} sponsors={byTier(tier.slug)} />
            ))}
            {openTiers.length > 0 && (
              <div>
                {sponsors.length > 0 && (
                  <h3 className="font-display text-xl font-bold text-deep-blue">Open slots</h3>
                )}
                <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {openTiers.map((tier) => (
                    <OpenSlot key={tier.slug} tier={tier} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="enquire"
        aria-labelledby="enquire-title"
        className="scroll-mt-20 bg-digital-teal py-20 text-deep-blue md:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-display text-sm font-bold uppercase">Sponsor enquiry</p>
            <h2 id="enquire-title" className="mt-3 text-h2">
              Let's build something together.
            </h2>
            <p className="mt-5 text-lg">
              Tell us about your organisation and what you'd like to achieve. We'll come back with
              options that fit, from headline partnership to community and media collaborations.
            </p>
            <p className="mt-6">
              Prefer email?{" "}
              <a href={`mailto:${EVENT.email}`} className="font-bold underline underline-offset-4">
                {EVENT.email}
              </a>
            </p>
          </div>
          <div className="rounded-md bg-paper p-6 text-ink shadow-xl sm:p-10">
            {/* Keyed so choosing an "Available" tier link preselects it. */}
            <SponsorEnquiryForm key={enquiryTier ?? "none"} defaultTier={enquiryTier} />
          </div>
        </div>
      </section>
    </>
  );
}

function TierSection({
  tier,
  sponsors,
}: {
  tier: (typeof SPONSOR_TIERS)[number];
  sponsors: Sponsor[];
}) {
  const layout =
    tier.slug === "headline"
      ? "grid-cols-1"
      : tier.slug === "gold"
        ? "md:grid-cols-2"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  const detailed = tier.slug === "headline" || tier.slug === "gold";

  return (
    <div>
      <h3 className="font-display text-xl font-bold text-deep-blue">{tier.name}</h3>
      <ul className={`mt-5 grid gap-5 ${layout}`}>
        {sponsors.map((sponsor) => (
          <li key={sponsor.id} className="reveal rounded-md bg-paper p-6 shadow-sm">
            <div className={`flex items-center ${detailed ? "h-24" : "h-16 justify-center"}`}>
              <SponsorLogo sponsor={sponsor} className={detailed ? "text-3xl" : "text-xl"} />
            </div>
            {detailed && sponsor.description && (
              <p className="mt-4 text-muted-foreground">{sponsor.description}</p>
            )}
            {sponsor.websiteUrl && (
              <a
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center gap-1 font-display font-semibold text-deep-blue underline underline-offset-4"
              >
                Visit {sponsor.name}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Invitation card for a tier with no partner yet; preselects it in the enquiry form. */
function OpenSlot({ tier }: { tier: (typeof SPONSOR_TIERS)[number] }) {
  return (
    <li className="flex flex-col rounded-md border-2 border-dashed border-deep-blue/30 p-6">
      <p className="font-display text-sm font-bold uppercase text-digital-teal">Available</p>
      <p className="mt-2 font-display text-xl font-bold text-deep-blue">{tier.name}</p>
      <p className="mt-2 flex-1 text-muted-foreground">{tier.pitch}</p>
      <Link
        to="/sponsors"
        search={{ tier: tier.slug }}
        hash="enquire"
        className="mt-4 inline-flex min-h-12 items-center gap-2 font-display font-bold text-deep-blue underline underline-offset-4"
      >
        Enquire about {tier.name.replace(/ Partners$/, "")}{" "}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </li>
  );
}

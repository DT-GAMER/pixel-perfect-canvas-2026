import type { Sponsor } from "@/lib/sponsors.functions";
import { SPONSOR_TIERS } from "@/lib/sponsorship";
import { SponsorLogo } from "./SponsorLogo";

const TOP_TIERS = new Set(["headline", "gold"]);

/**
 * Homepage partner strip: headline and gold partners shown large, other tiers in
 * an infinite marquee. With no partners yet, the marquee advertises open tiers.
 */
export function SponsorsPreview({ sponsors }: { sponsors: Sponsor[] }) {
  const top = sponsors.filter((sponsor) => TOP_TIERS.has(sponsor.tier));
  const rest = sponsors.filter((sponsor) => !TOP_TIERS.has(sponsor.tier));

  return (
    <>
      {top.length > 0 && (
        <ul
          className="mx-auto mt-14 flex max-w-7xl flex-wrap items-center justify-center gap-x-16 gap-y-8 px-5"
          aria-label="Headline and gold partners"
        >
          {top.map((sponsor) => (
            <li key={sponsor.id} className="flex h-20 items-center">
              <SponsorLogo sponsor={sponsor} className="text-3xl md:text-4xl" />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-14 overflow-hidden border-y border-light-grey py-8">
        {rest.length > 0 ? (
          <Marquee label="Partners">
            {[...rest, ...rest].map((sponsor, index) => (
              <li
                key={`${sponsor.id}-${index}`}
                aria-hidden={index >= rest.length}
                className="flex h-14 items-center"
              >
                <SponsorLogo
                  sponsor={sponsor}
                  className="whitespace-nowrap text-2xl text-deep-blue/60 md:text-3xl"
                />
              </li>
            ))}
          </Marquee>
        ) : (
          top.length === 0 && (
            <Marquee label="Partnership tiers available">
              {[...SPONSOR_TIERS, ...SPONSOR_TIERS].map((tier, index) => (
                <li
                  key={`${tier.slug}-${index}`}
                  aria-hidden={index >= SPONSOR_TIERS.length}
                  className="whitespace-nowrap font-display text-2xl font-bold text-deep-blue/40 md:text-4xl"
                >
                  {tier.name.replace(/ Partners$/, "")} partner{" "}
                  <span className="text-signal-orange">·</span> open
                </li>
              ))}
            </Marquee>
          )
        )}
      </div>
    </>
  );
}

function Marquee({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ul
      aria-label={label}
      className="sponsor-marquee flex w-max items-center gap-12 px-6 md:gap-20"
    >
      {children}
    </ul>
  );
}

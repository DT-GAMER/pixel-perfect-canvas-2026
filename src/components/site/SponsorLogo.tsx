import type { Sponsor } from "@/lib/sponsors.functions";

/** Sponsor logo, or the name set in the display face when no logo is uploaded yet. */
export function SponsorLogo({ sponsor, className = "" }: { sponsor: Sponsor; className?: string }) {
  if (sponsor.logoUrl) {
    return (
      <img
        src={sponsor.logoUrl}
        alt={sponsor.logoAlt ?? sponsor.name}
        loading="lazy"
        className={`max-h-full max-w-full object-contain ${className}`}
      />
    );
  }
  return (
    <span className={`font-display font-bold text-deep-blue ${className}`}>{sponsor.name}</span>
  );
}

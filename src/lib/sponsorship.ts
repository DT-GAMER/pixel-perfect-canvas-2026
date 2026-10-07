import { z } from "zod";

// Sponsor tiers, highest first. Slugs match sponsors.tier in the database.
export const SPONSOR_TIERS = [
  {
    slug: "headline",
    name: "Headline",
    pitch: "The presenting partner: top billing across the summit, campaign, and stage.",
  },
  { slug: "gold", name: "Gold", pitch: "Prominent placement and a voice in the conversation." },
  { slug: "silver", name: "Silver", pitch: "Visible support for Nigeria's tech community." },
  { slug: "bronze", name: "Bronze", pitch: "An accessible way to stand behind emerging builders." },
  {
    slug: "community",
    name: "Community Partners",
    pitch: "Communities and hubs growing the ecosystem with us.",
  },
  {
    slug: "media",
    name: "Media Partners",
    pitch: "Publishers and creators amplifying the conversation.",
  },
] as const;

export type TierSlug = (typeof SPONSOR_TIERS)[number]["slug"];

/** Values for "tier of interest" (matches sponsor_enquiries.tier_interest). */
export const ENQUIRY_TIERS = [
  "headline",
  "gold",
  "silver",
  "bronze",
  "community",
  "media",
  "not-sure",
] as const satisfies readonly (TierSlug | "not-sure")[];

export const sponsorEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(100, "Name must be 100 characters or fewer"),
  company: z
    .string()
    .trim()
    .min(2, "Enter your company or organisation")
    .max(120, "Company must be 120 characters or fewer"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be 40 characters or fewer")
    .regex(/^[+()\d\s-]*$/, "Use digits, spaces, and + ( ) - only")
    .optional(),
  tierInterest: z.enum(ENQUIRY_TIERS, {
    errorMap: () => ({ message: "Choose a tier, or “Not sure yet”" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little about what you have in mind")
    .max(3000, "Message must be 3000 characters or fewer"),
  // Honeypot: must stay empty.
  website: z.string().max(0),
});

export type SponsorEnquiryInput = z.infer<typeof sponsorEnquirySchema>;

export const tierName = (slug: string) =>
  slug === "not-sure"
    ? "Not sure yet"
    : (SPONSOR_TIERS.find((tier) => tier.slug === slug)?.name ?? slug);

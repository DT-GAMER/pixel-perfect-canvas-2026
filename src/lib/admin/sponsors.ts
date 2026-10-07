import { z } from "zod";
import { SPONSOR_TIERS } from "@/lib/sponsorship";

const tierSlugs = [
  "headline",
  "gold",
  "silver",
  "bronze",
  "community",
  "media",
] as const satisfies readonly (typeof SPONSOR_TIERS)[number]["slug"][];

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => !value || /^https?:\/\/\S+$/.test(value),
    "Enter a full URL starting with https://",
  )
  .transform((value) => value || null);

export const sponsorFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Enter the sponsor's name").max(100),
    tier: z.enum(tierSlugs),
    websiteUrl: optionalUrl,
    description: z
      .string()
      .trim()
      .max(600, "Keep it under 600 characters")
      .transform((value) => value || null),
    logoUrl: z.string().url().nullable(),
    logoAlt: z.string().trim().max(200),
    isVisible: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.logoUrl && value.logoAlt.length < 2)
      context.addIssue({
        code: "custom",
        path: ["logoAlt"],
        message: "Describe the logo (usually the sponsor's name)",
      });
  });

export type SponsorForm = z.input<typeof sponsorFormSchema>;

export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;

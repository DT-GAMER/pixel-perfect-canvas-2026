import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";
import { TRACKS } from "@/lib/tracks";

const trackSlugs = TRACKS.map((track) => track.slug) as [string, ...string[]];

const optionalHttps = (label: string) =>
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => !value || /^https:\/\/\S+$/.test(value),
      `${label} must be a full https:// link`,
    )
    .transform((value) => value || null);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .transform((value) => value || null);

export const speakerFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Enter the speaker's name").max(100),
    slug: z
      .string()
      .trim()
      .max(80)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers, and hyphens"),
    role: optionalText(100),
    organization: optionalText(100),
    bio: optionalText(2000),
    track: z.union([z.enum(trackSlugs), z.literal("")]).transform((value) => value || null),
    photoUrl: z.string().url().nullable(),
    photoAlt: z.string().trim().max(200),
    linkedinUrl: optionalHttps("LinkedIn"),
    xUrl: optionalHttps("X"),
    instagramUrl: optionalHttps("Instagram"),
    websiteUrl: optionalHttps("Website"),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.photoUrl && value.photoAlt.length < 3)
      context.addIssue({
        code: "custom",
        path: ["photoAlt"],
        message: "Describe the photo, e.g. “Portrait of Amara Okafor”",
      });
  });

export type SpeakerForm = z.input<typeof speakerFormSchema>;

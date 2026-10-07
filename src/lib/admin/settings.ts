import { z } from "zod";

const datetimeLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a date and time");
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

export const settingsFormSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    tagline: z.string().trim().max(160),
    theme: z.string().trim().min(3).max(200),
    themeShort: z.string().trim().min(3).max(120),
    venue: z.string().trim().min(2).max(120),
    format: z.string().trim().min(2).max(80),
    startsAt: datetimeLocal,
    endsAt: datetimeLocal,
    email: z.string().trim().email("Enter a valid email").max(255),
    xUrl: optionalHttps("X"),
    linkedinUrl: optionalHttps("LinkedIn"),
    instagramUrl: optionalHttps("Instagram"),
    stats: z
      .array(
        z.object({
          value: z.coerce.number().int("Whole numbers only").min(0).max(10_000_000),
          suffix: z.string().trim().max(4),
          label: z.string().trim().min(2, "Add a label").max(80),
        }),
      )
      .max(6),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    path: ["endsAt"],
    message: "Must be after the start",
  });

export type SettingsForm = z.input<typeof settingsFormSchema>;

export const privacySchema = z.object({
  // null = use the built-in policy
  content: z
    .object({
      type: z.literal("doc"),
      content: z.array(z.record(z.unknown())).max(2000).optional(),
    })
    .nullable(),
});

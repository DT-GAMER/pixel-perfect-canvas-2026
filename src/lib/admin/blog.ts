import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";
import { imageUrl } from "./image-url";

export const POST_STATUSES = ["draft", "published", "scheduled"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .transform((value) => value || null);

// Stored as Tiptap JSON; the public renderer only outputs known node types.
const docSchema = z
  .object({ type: z.literal("doc"), content: z.array(z.record(z.unknown())).max(3000).optional() })
  .refine((doc) => JSON.stringify(doc).length <= 600_000, "The article is too long");

export const postFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(3, "Give the post a title").max(160),
    slug: z
      .string()
      .trim()
      .max(120)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers, and hyphens"),
    excerpt: z.string().trim().min(10, "Write a short excerpt (at least 10 characters)").max(400),
    content: docSchema,
    coverImageUrl: imageUrl,
    coverImageAlt: z.string().trim().max(200),
    categoryId: z.union([z.string().uuid(), z.literal("")]).transform((value) => value || null),
    tags: z
      .string()
      .max(400)
      .transform((value) => [
        ...new Set(
          value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ])
      .refine(
        (tags) => tags.length <= 10 && tags.every((tag) => tag.length <= 30),
        "Up to 10 tags, 30 characters each",
      ),
    authorName: z.string().trim().min(2, "Who wrote it?").max(100),
    authorRole: optionalText(100),
    isFree: z.boolean(),
    previewParagraphs: z.coerce.number().int().min(1, "At least 1").max(20, "At most 20"),
    status: z.enum(POST_STATUSES),
    // datetime-local value, interpreted as Lagos time (UTC+1)
    publishedAt: z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/, "Choose a date and time"),
    seoTitle: optionalText(70),
    seoDescription: optionalText(200),
  })
  .superRefine((value, context) => {
    if (value.coverImageUrl && value.coverImageAlt.length < 3)
      context.addIssue({
        code: "custom",
        path: ["coverImageAlt"],
        message: "Describe the cover image",
      });
    if (value.status === "scheduled" && !value.publishedAt)
      context.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Choose when to publish",
      });
  });

export type PostForm = z.input<typeof postFormSchema>;

/** "2026-10-15T16:00" (Lagos) ↔ ISO timestamp */
export const lagosInputToIso = (value: string) => new Date(`${value}:00+01:00`).toISOString();
export const isoToLagosInput = (iso: string | null) =>
  iso ? new Date(new Date(iso).getTime() + 3_600_000).toISOString().slice(0, 16) : "";

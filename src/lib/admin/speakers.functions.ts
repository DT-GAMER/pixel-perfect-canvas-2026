import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { speakerFormSchema } from "./speakers";

async function admin() {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const fail = (error: { message: string; code?: string } | null) => {
  if (error?.code === "23505") throw new Error("Another speaker already uses that URL slug");
  if (error) throw new Error(error.message);
};

export type AdminSpeaker = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  organization: string | null;
  bio: string | null;
  track: string | null;
  photo_url: string | null;
  photo_alt: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
};

export const speakersDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db
    .from("speakers")
    .select(
      "id, slug, name, role, organization, bio, track, photo_url, photo_alt, linkedin_url, x_url, instagram_url, website_url, is_featured, is_published, display_order",
    )
    .order("display_order")
    .order("name");
  fail(error);
  return (data ?? []) as AdminSpeaker[];
});

export const saveSpeaker = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => speakerFormSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const row = {
      slug: data.slug,
      name: data.name,
      role: data.role,
      organization: data.organization,
      bio: data.bio,
      track: data.track,
      photo_url: data.photoUrl,
      photo_alt: data.photoUrl ? data.photoAlt : null,
      linkedin_url: data.linkedinUrl,
      x_url: data.xUrl,
      instagram_url: data.instagramUrl,
      website_url: data.websiteUrl,
      is_featured: data.isFeatured,
      is_published: data.isPublished,
    };
    if (data.id) {
      fail((await db.from("speakers").update(row).eq("id", data.id)).error);
    } else {
      const { data: last } = await db
        .from("speakers")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      fail(
        (
          await db
            .from("speakers")
            .insert({ ...row, display_order: (last?.display_order ?? -1) + 1 })
        ).error,
      );
    }
    return { ok: true };
  });

export const setSpeakerFlags = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        isFeatured: z.boolean().optional(),
        isPublished: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const patch: { is_featured?: boolean; is_published?: boolean } = {};
    if (data.isFeatured !== undefined) patch.is_featured = data.isFeatured;
    if (data.isPublished !== undefined) patch.is_published = data.isPublished;
    fail((await db.from("speakers").update(patch).eq("id", data.id)).error);
    return { ok: true };
  });

export const deleteSpeaker = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    fail((await db.from("speakers").delete().eq("id", data.id)).error);
    return { ok: true };
  });

export const reorderSpeakers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).max(500) }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const results = await Promise.all(
      data.ids.map((id, index) =>
        db.from("speakers").update({ display_order: index }).eq("id", id),
      ),
    );
    for (const result of results) fail(result.error);
    return { ok: true };
  });

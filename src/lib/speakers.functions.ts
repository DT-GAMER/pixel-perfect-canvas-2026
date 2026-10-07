import { createServerFn } from "@tanstack/react-start";

export type Speaker = {
  slug: string;
  name: string;
  role: string | null;
  organization: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
  track: string | null;
  socials: { label: "LinkedIn" | "X" | "Instagram" | "Website"; href: string }[];
  isFeatured: boolean;
};

const COLUMNS =
  "slug, name, role, organization, bio, photo_url, photo_alt, track, linkedin_url, x_url, instagram_url, website_url, is_featured";

type Row = {
  slug: string;
  name: string;
  role: string | null;
  organization: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_alt: string | null;
  track: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  is_featured: boolean;
};

const toSpeaker = (row: Row): Speaker => ({
  slug: row.slug,
  name: row.name,
  role: row.role,
  organization: row.organization,
  bio: row.bio,
  photoUrl: row.photo_url,
  photoAlt: row.photo_alt,
  track: row.track,
  socials: (
    [
      ["LinkedIn", row.linkedin_url],
      ["X", row.x_url],
      ["Instagram", row.instagram_url],
      ["Website", row.website_url],
    ] as const
  ).flatMap(([label, href]) => (href ? [{ label, href }] : [])),
  isFeatured: row.is_featured,
});

async function publishedSpeakers(featuredOnly: boolean) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin
    .from("speakers")
    .select(COLUMNS)
    .eq("is_published", true)
    .order("display_order")
    .order("name");
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Row[]).map(toSpeaker);
}

export const listSpeakers = createServerFn({ method: "GET" }).handler(() =>
  publishedSpeakers(false),
);

export const featuredSpeakers = createServerFn({ method: "GET" }).handler(() =>
  publishedSpeakers(true),
);

// The summit's four conversations. Slugs match speakers.track in the database.
export const TRACKS = [
  { slug: "ai-and-jobs", name: "AI & Jobs" },
  { slug: "privacy", name: "Privacy" },
  { slug: "financial-security", name: "Financial Security" },
  { slug: "nigerias-direction", name: "Nigeria's Direction" },
] as const;

export type TrackSlug = (typeof TRACKS)[number]["slug"];

export const trackName = (slug: string | null) =>
  TRACKS.find((track) => track.slug === slug)?.name ?? null;

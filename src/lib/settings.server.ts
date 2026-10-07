// Loads site settings from the database into EVENT. Server only.
import { applySettings, DEFAULT_SETTINGS, type SiteSettings, type Stat } from "./event";

const CACHE_MS = 30_000;
let cached: { value: SiteSettings; at: number } | undefined;

export async function loadSettings(): Promise<SiteSettings> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    applySettings(cached.value);
    return cached.value;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select(
      "event_name, tagline, theme, theme_short, venue, format, starts_at, ends_at, contact_email, x_url, linkedin_url, instagram_url, stats",
    )
    .maybeSingle();
  if (error) throw new Error(error.message);
  const value: SiteSettings = data
    ? {
        name: data.event_name,
        tagline: data.tagline,
        theme: data.theme,
        themeShort: data.theme_short,
        venue: data.venue,
        format: data.format,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        email: data.contact_email,
        xUrl: data.x_url,
        linkedinUrl: data.linkedin_url,
        instagramUrl: data.instagram_url,
        stats: (data.stats as Stat[] | null) ?? [],
      }
    : DEFAULT_SETTINGS;
  cached = { value, at: Date.now() };
  applySettings(value);
  return value;
}

/** Call after saving settings so the next request reloads them. */
export const invalidateSettings = () => {
  cached = undefined;
};

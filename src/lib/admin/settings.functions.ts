import { createServerFn } from "@tanstack/react-start";
import type { Json } from "@/integrations/supabase/types";
import type { RichDoc } from "@/lib/rich-text";
import { isoToLagosInput, lagosInputToIso } from "./blog";
import { privacySchema, settingsFormSchema, type SettingsForm } from "./settings";

async function admin() {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const settingsEditorData = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { loadSettings } = await import("@/lib/settings.server");
  const [current, privacy] = await Promise.all([
    loadSettings(),
    db.from("site_settings").select("privacy_policy, updated_at").maybeSingle(),
  ]);
  if (privacy.error) throw new Error(privacy.error.message);
  const form: SettingsForm = {
    ...current,
    startsAt: isoToLagosInput(current.startsAt),
    endsAt: isoToLagosInput(current.endsAt),
    xUrl: current.xUrl ?? "",
    linkedinUrl: current.linkedinUrl ?? "",
    instagramUrl: current.instagramUrl ?? "",
  };
  return {
    form,
    privacy: (privacy.data?.privacy_policy as RichDoc | null) ?? null,
    updatedAt: privacy.data?.updated_at ?? null,
  };
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => settingsFormSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("site_settings")
      .update({
        event_name: data.name,
        tagline: data.tagline,
        theme: data.theme,
        theme_short: data.themeShort,
        venue: data.venue,
        format: data.format,
        starts_at: lagosInputToIso(data.startsAt),
        ends_at: lagosInputToIso(data.endsAt),
        contact_email: data.email,
        x_url: data.xUrl,
        linkedin_url: data.linkedinUrl,
        instagram_url: data.instagramUrl,
        stats: data.stats as unknown as Json,
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    const { invalidateSettings } = await import("@/lib/settings.server");
    invalidateSettings();
    return { ok: true };
  });

export const savePrivacyPolicy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => privacySchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("site_settings")
      .update({ privacy_policy: data.content as unknown as Json })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

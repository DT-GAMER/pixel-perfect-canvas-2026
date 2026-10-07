import { createServerFn } from "@tanstack/react-start";
import type { RichDoc } from "./rich-text";

/** The admin-edited privacy policy, or null to show the built-in one. */
export const getPrivacyPolicy = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("privacy_policy, updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    content: (data?.privacy_policy as RichDoc | null) ?? null,
    updatedAt: data?.updated_at ?? null,
  };
});

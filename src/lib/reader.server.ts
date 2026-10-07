// Magic sign-in links for blog readers. Server only.
//
// We generate the token with the Supabase admin API and email our own branded
// link (via Resend), which lands on /auth/confirm to start a cookie session.
import { siteUrl } from "./email-layout.server";
import { safeNextPath } from "./reader";

export async function createSignInLink(email: string, next: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Readers are created on first sign-in. Already existing is fine.
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (createError && createError.code !== "email_exists") {
    throw new Error(`Creating reader failed: ${createError.message}`);
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) {
    throw new Error(`Generating sign-in link failed: ${error?.message ?? "no token"}`);
  }

  const params = new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: "email",
    next: safeNextPath(next),
  });
  return `${siteUrl()}/auth/confirm?${params}`;
}

export async function sendSignInEmail(email: string, next: string) {
  const { sendEmail } = await import("./email.server");
  const { readerSignInEmail } = await import("./reader-email.server");
  const link = await createSignInLink(email, next);
  await sendEmail(readerSignInEmail(email, link));
}

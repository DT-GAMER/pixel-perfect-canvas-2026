import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { safeNextPath } from "./reader";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  next: z.string().max(300).optional(),
});

export type SignInResult = { status: "sent" } | { status: "rate_limited" } | { status: "error" };

/**
 * Emails a magic sign-in link to returning readers. Only registered emails get one,
 * but the response is the same either way so it can't be used to look up registrations.
 */
export const requestSignInLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signInSchema.parse(input))
  .handler(async ({ data }): Promise<SignInResult> => {
    const { consumeAttempt } = await import("./rate-limit.server");
    try {
      if (!(await consumeAttempt("reader-sign-in", 5))) return { status: "rate_limited" };
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return { status: "error" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: registration, error } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("email_normalized", data.email.toLowerCase())
      .maybeSingle();
    if (error) {
      console.error("Sign-in lookup failed", error.message);
      return { status: "error" };
    }
    if (!registration) return { status: "sent" };

    try {
      const { sendSignInEmail } = await import("./reader.server");
      await sendSignInEmail(data.email, safeNextPath(data.next));
    } catch (cause) {
      console.error("Sign-in email failed", cause instanceof Error ? cause.message : cause);
      return { status: "error" };
    }
    return { status: "sent" };
  });

export const signOutReader = createServerFn({ method: "POST" }).handler(async () => {
  const { createReaderClient } = await import("@/integrations/supabase/reader-session.server");
  await createReaderClient().auth.signOut({ scope: "local" });
  return { ok: true };
});

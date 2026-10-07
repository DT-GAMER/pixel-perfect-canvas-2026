import { createServerFn } from "@tanstack/react-start";
import { consumeAttempt } from "./rate-limit.server";
import { safeNextPath } from "./reader";
import { registrationSchema } from "./registration";

export type RegistrationResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "rate_limited" }
  | { status: "invalid"; message: string }
  | { status: "error" };

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }): Promise<RegistrationResult> => {
    // Honeypot filled in: pretend it worked so bots learn nothing.
    if (data.website) return { status: "success" };

    let allowed;
    try {
      allowed = await consumeAttempt("registration", 5);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return { status: "error" };
    }
    if (!allowed) return { status: "rate_limited" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim();
    // Set when registering from a blog sign-up wall: also sign them in to keep reading.
    const next = data.next ? safeNextPath(data.next) : undefined;

    const { data: registration, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name: data.fullName,
        email,
        profession: data.profession,
        other_profession: data.profession === "Other" ? data.otherProfession?.trim() || null : null,
        country: data.country,
        city: data.city,
        privacy_agreed: data.privacyAgreed,
        subscribe_updates: data.subscribeUpdates,
      })
      .select("id")
      .single();

    if (error?.code === "23505") {
      // Already registered: from the blog wall, email them a sign-in link instead.
      if (next) {
        await sendSignInEmail(email, next).catch((cause) =>
          console.error(
            "Sign-in email for existing registrant failed",
            cause instanceof Error ? cause.message : cause,
          ),
        );
      }
      return { status: "duplicate" };
    }
    if (error || !registration) {
      console.error("Registration insert failed", error?.message);
      return { status: "error" };
    }

    // The registration is saved; a failed email is recorded but never fails the request.
    await sendConfirmationEmail({ id: registration.id, fullName: data.fullName, email }, next);
    return { status: "success" };
  });

async function sendSignInEmail(email: string, next: string) {
  const { sendSignInEmail: send } = await import("./reader.server");
  await send(email, next);
}

async function sendConfirmationEmail(
  registrant: { id: string; fullName: string; email: string },
  next: string | undefined,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendEmail } = await import("./email.server");
  const { registrationConfirmationEmail } = await import("./registration-email.server");

  let update;
  try {
    let readLink;
    if (next) {
      const { createSignInLink } = await import("./reader.server");
      readLink = await createSignInLink(registrant.email, next);
    }
    const { id } = await sendEmail(registrationConfirmationEmail({ ...registrant, readLink }));
    update = {
      confirmation_email_status: "sent",
      confirmation_email_id: id,
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Registration confirmation email failed", message);
    update = {
      confirmation_email_status: "failed",
      confirmation_email_error: message.slice(0, 500),
    };
  }

  const { error } = await supabaseAdmin
    .from("registrations")
    .update(update)
    .eq("id", registrant.id);
  if (error) console.error("Recording confirmation email status failed", error.message);
}

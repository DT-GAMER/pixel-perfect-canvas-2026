import { createServerFn } from "@tanstack/react-start";
import { sponsorEnquirySchema } from "./sponsorship";

export type Sponsor = {
  id: string;
  name: string;
  tier: string;
  logoUrl: string | null;
  logoAlt: string | null;
  websiteUrl: string | null;
  description: string | null;
};

export const listSponsors = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("sponsors")
    .select("id, name, tier, logo_url, logo_alt, website_url, description")
    .eq("is_visible", true)
    .order("display_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data.map((row): Sponsor => ({
    id: row.id,
    name: row.name,
    tier: row.tier,
    logoUrl: row.logo_url,
    logoAlt: row.logo_alt,
    websiteUrl: row.website_url,
    description: row.description,
  }));
});

export type EnquiryResult =
  { status: "success" } | { status: "rate_limited" } | { status: "error" };

export const submitSponsorEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => sponsorEnquirySchema.parse(input))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    // Honeypot filled in: pretend it worked.
    if (data.website) return { status: "success" };

    const { consumeAttempt } = await import("./rate-limit.server");
    try {
      if (!(await consumeAttempt("sponsor-enquiry", 3))) return { status: "rate_limited" };
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return { status: "error" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const enquiry = {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone || undefined,
      tierInterest: data.tierInterest,
      message: data.message,
    };
    const { data: row, error } = await supabaseAdmin
      .from("sponsor_enquiries")
      .insert({
        name: enquiry.name,
        company: enquiry.company,
        email: enquiry.email,
        phone: enquiry.phone ?? null,
        tier_interest: enquiry.tierInterest,
        message: enquiry.message,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("Sponsor enquiry insert failed", error?.message);
      return { status: "error" };
    }

    // Saved; email problems are recorded but don't fail the request.
    const { sendEmail } = await import("./email.server");
    const { sponsorEnquiryNotification, sponsorEnquiryAcknowledgement } =
      await import("./sponsor-email.server");
    const saved = { ...enquiry, id: row.id };
    try {
      await sendEmail(sponsorEnquiryNotification(saved));
      await supabaseAdmin
        .from("sponsor_enquiries")
        .update({ notified_at: new Date().toISOString(), notification_error: null })
        .eq("id", row.id);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.error("Sponsor enquiry notification failed", message);
      await supabaseAdmin
        .from("sponsor_enquiries")
        .update({ notification_error: message.slice(0, 500) })
        .eq("id", row.id);
    }
    await sendEmail(sponsorEnquiryAcknowledgement(saved)).catch((cause) =>
      console.error(
        "Sponsor enquiry acknowledgement failed",
        cause instanceof Error ? cause.message : cause,
      ),
    );

    return { status: "success" };
  });

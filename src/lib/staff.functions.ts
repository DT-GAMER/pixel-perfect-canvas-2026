import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Staff } from "./staff";

/** The signed-in staff member, or null. Used by the /admin route guard. */
export const getStaff = createServerFn({ method: "GET" }).handler(
  async (): Promise<Staff | null> => {
    const { getStaffMember } = await import("./staff.server");
    return getStaffMember();
  },
);

export type StaffSignInResult =
  { status: "sent" } | { status: "rate_limited" } | { status: "error" };

/**
 * Emails a dashboard sign-in link to staff. Same response for any email so the
 * form can't reveal who has access.
 */
export const requestStaffSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }): Promise<StaffSignInResult> => {
    const { consumeAttempt } = await import("./rate-limit.server");
    try {
      if (!(await consumeAttempt("staff-sign-in", 5))) return { status: "rate_limited" };
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return { status: "error" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .ilike("email", data.email.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (error) {
      console.error("Staff lookup failed", error.message);
      return { status: "error" };
    }
    if (!profile) {
      // First deployment: BOOTSTRAP_ADMIN_EMAIL becomes admin, but only while
      // there are no staff at all. Afterwards admins invite people from Team.
      const bootstrap = process.env["BOOTSTRAP_ADMIN_EMAIL"]?.trim().toLowerCase();
      if (!bootstrap || bootstrap !== data.email.toLowerCase()) return { status: "sent" };
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (count !== 0) return { status: "sent" };
      const created = await supabaseAdmin.auth.admin.createUser({
        email: bootstrap,
        email_confirm: true,
      });
      let userId = created.data.user?.id;
      if (!userId && created.error?.code === "email_exists") {
        userId = (
          await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: bootstrap })
        ).data.user?.id;
      }
      if (!userId) {
        console.error("Bootstrap admin creation failed", created.error?.message);
        return { status: "error" };
      }
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, email: bootstrap, role: "admin" });
      if (insertError) {
        console.error("Bootstrap admin profile failed", insertError.message);
        return { status: "error" };
      }
      console.info(`Bootstrap admin created for ${bootstrap}`);
    }

    try {
      const { createSignInLink } = await import("./reader.server");
      const { sendEmail } = await import("./email.server");
      const { staffSignInEmail } = await import("./reader-email.server");
      const email = profile?.email ?? data.email.toLowerCase();
      const link = await createSignInLink(email, "/admin");
      await sendEmail(staffSignInEmail(email, link));
    } catch (cause) {
      console.error("Staff sign-in email failed", cause instanceof Error ? cause.message : cause);
      return { status: "error" };
    }
    return { status: "sent" };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const roleSchema = z.enum(["admin", "editor"]);

async function admin() {
  const { requireStaff } = await import("@/lib/staff.server");
  const me = await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { me, db: supabaseAdmin };
}

export type TeamMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
};

export const teamDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { me, db } = await admin();
  const { data, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at");
  if (error) throw new Error(error.message);
  return { members: data as TeamMember[], meId: me.id };
});

export const inviteMember = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
        fullName: z.string().trim().max(100).optional(),
        role: roleSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { me, db } = await admin();

    // Create the login (or find it: they may already be a blog reader).
    let userId: string | undefined;
    const created = await db.auth.admin.createUser({ email: data.email, email_confirm: true });
    if (created.data.user) userId = created.data.user.id;
    else if (created.error?.code === "email_exists") {
      const link = await db.auth.admin.generateLink({ type: "magiclink", email: data.email });
      userId = link.data.user?.id;
    } else if (created.error) throw new Error(created.error.message);
    if (!userId) throw new Error("Couldn't create the account");

    const { data: existing } = await db
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (existing) throw new Error("That person is already on the team");
    const { error } = await db.from("profiles").insert({
      id: userId,
      email: data.email,
      full_name: data.fullName || null,
      role: data.role,
      invited_by: me.id,
    });
    if (error) throw new Error(error.message);

    // The invitation email is a sign-in link straight to the dashboard.
    const { createSignInLink } = await import("@/lib/reader.server");
    const { sendEmail } = await import("@/lib/email.server");
    const { staffInviteEmail } = await import("@/lib/reader-email.server");
    try {
      const link = await createSignInLink(data.email, "/admin");
      await sendEmail(staffInviteEmail(data.email, link, data.role, me.fullName ?? me.email));
      return { emailed: true };
    } catch (cause) {
      console.error("Invite email failed", cause instanceof Error ? cause.message : cause);
      return { emailed: false };
    }
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), role: roleSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { me, db } = await admin();
    if (data.id === me.id) throw new Error("You can't change your own role");
    const { error } = await db.from("profiles").update({ role: data.role }).eq("id", data.id);
    if (error) throw new Error(error.message);
    const { forgetStaff } = await import("@/lib/staff.server");
    forgetStaff(data.id);
    return { ok: true };
  });

/** Removes dashboard access. The login itself stays (they may also be a blog reader). */
export const removeMember = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { me, db } = await admin();
    if (data.id === me.id) throw new Error("You can't remove yourself");
    const { error } = await db.from("profiles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const { forgetStaff } = await import("@/lib/staff.server");
    forgetStaff(data.id);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ENQUIRY_STATUSES, sponsorFormSchema } from "./sponsors";

async function admin() {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export type AdminSponsor = {
  id: string;
  name: string;
  tier: string;
  website_url: string | null;
  description: string | null;
  logo_url: string | null;
  logo_alt: string | null;
  is_visible: boolean;
  display_order: number;
};

export type AdminEnquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  tier_interest: string;
  message: string;
  status: string;
  notes: string | null;
  notified_at: string | null;
  notification_error: string | null;
  created_at: string;
};

export const sponsorsDashboard = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ status: z.enum(ENQUIRY_STATUSES).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    let enquiries = db
      .from("sponsor_enquiries")
      .select(
        "id, name, company, email, phone, tier_interest, message, status, notes, notified_at, notification_error, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status) enquiries = enquiries.eq("status", data.status);
    const [sponsors, enquiryRows, counts] = await Promise.all([
      db
        .from("sponsors")
        .select(
          "id, name, tier, website_url, description, logo_url, logo_alt, is_visible, display_order",
        )
        .order("display_order")
        .order("name"),
      enquiries,
      db.from("sponsor_enquiries").select("status"),
    ]);
    fail(sponsors.error);
    fail(enquiryRows.error);
    fail(counts.error);
    const byStatus = Object.fromEntries(ENQUIRY_STATUSES.map((status) => [status, 0])) as Record<
      string,
      number
    >;
    for (const row of counts.data ?? []) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    return {
      sponsors: (sponsors.data ?? []) as AdminSponsor[],
      enquiries: (enquiryRows.data ?? []) as AdminEnquiry[],
      enquiryCounts: byStatus,
    };
  });

export const saveSponsor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => sponsorFormSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const row = {
      name: data.name,
      tier: data.tier,
      website_url: data.websiteUrl,
      description: data.description,
      logo_url: data.logoUrl,
      logo_alt: data.logoUrl ? data.logoAlt : null,
      is_visible: data.isVisible,
    };
    if (data.id) {
      fail((await db.from("sponsors").update(row).eq("id", data.id)).error);
    } else {
      // New sponsors go to the end of the list.
      const { data: last } = await db
        .from("sponsors")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      fail(
        (
          await db
            .from("sponsors")
            .insert({ ...row, display_order: (last?.display_order ?? -1) + 1 })
        ).error,
      );
    }
    return { ok: true };
  });

export const setSponsorVisible = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), visible: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    fail((await db.from("sponsors").update({ is_visible: data.visible }).eq("id", data.id)).error);
    return { ok: true };
  });

export const deleteSponsor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    fail((await db.from("sponsors").delete().eq("id", data.id)).error);
    return { ok: true };
  });

export const reorderSponsors = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).max(500) }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const results = await Promise.all(
      data.ids.map((id, index) =>
        db.from("sponsors").update({ display_order: index }).eq("id", id),
      ),
    );
    for (const result of results) fail(result.error);
    return { ok: true };
  });

export const updateEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(ENQUIRY_STATUSES).optional(),
        notes: z.string().max(5000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const patch: { status?: string; notes?: string | null } = {};
    if (data.status) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes.trim() || null;
    fail((await db.from("sponsor_enquiries").update(patch).eq("id", data.id)).error);
    return { ok: true };
  });

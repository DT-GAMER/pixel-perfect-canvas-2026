import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PAGE_SIZE, registrationFiltersSchema } from "./registrations";

export type AdminRegistration = {
  id: string;
  full_name: string;
  email: string;
  profession: string;
  other_profession: string | null;
  country: string;
  city: string;
  subscribe_updates: boolean;
  privacy_agreed: boolean;
  confirmation_email_status: string;
  confirmation_email_sent_at: string | null;
  confirmation_email_error: string | null;
  created_at: string;
};

export const listRegistrations = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => registrationFiltersSchema.parse(input))
  .handler(async ({ data: filters }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    await requireStaff("admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { filteredRegistrations } = await import("./registrations.server");

    const page = filters.page ?? 1;
    const [list, countries] = await Promise.all([
      filteredRegistrations(supabaseAdmin, filters, true).range(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE - 1,
      ),
      supabaseAdmin.from("registrations").select("country").limit(20000),
    ]);
    if (list.error) throw new Error(list.error.message);
    if (countries.error) throw new Error(countries.error.message);

    return {
      rows: (list.data ?? []) as AdminRegistration[],
      total: list.count ?? 0,
      page,
      pageCount: Math.max(1, Math.ceil((list.count ?? 0) / PAGE_SIZE)),
      // Only countries that actually appear, for the filter dropdown.
      countries: [...new Set(countries.data.map((row) => row.country))].sort(),
    };
  });

export const deleteRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff.server");
    await requireStaff("admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("registrations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

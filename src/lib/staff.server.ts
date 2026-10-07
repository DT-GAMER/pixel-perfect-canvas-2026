// Staff authorisation for admin server functions. Server only.
import type { Staff, StaffRole } from "./staff";

/** The signed-in staff member for this request, or null (readers have no profile). */
export async function getStaffMember(): Promise<Staff | null> {
  const { getReader } = await import("@/integrations/supabase/reader-session.server");
  const user = await getReader();
  if (!user) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, email: data.email, fullName: data.full_name, role: data.role as StaffRole };
}

/**
 * Call first in every admin server function. Throws unless the caller is staff
 * with one of the allowed roles (default: admin only).
 */
export async function requireStaff(...roles: StaffRole[]): Promise<Staff> {
  const staff = await getStaffMember();
  const allowed = roles.length ? roles : ["admin"];
  if (!staff || !allowed.includes(staff.role)) throw new Error("Forbidden");
  return staff;
}

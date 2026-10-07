// Staff authorisation for admin server functions. Server only.
import type { Staff, StaffRole } from "./staff";

// Roles cached briefly per user: an admin page otherwise looks the profile up
// several times per navigation. Role changes apply within CACHE_MS.
const CACHE_MS = 30_000;
const cache = new Map<string, { staff: Staff | null; expires: number }>();

/** Clears cached roles, e.g. after team changes. */
export const forgetStaff = (userId?: string) => (userId ? cache.delete(userId) : cache.clear());

/** The signed-in staff member for this request, or null (readers have no profile). */
export async function getStaffMember(): Promise<Staff | null> {
  const { getReader } = await import("@/integrations/supabase/reader-session.server");
  const user = await getReader();
  if (!user) return null;
  const cached = cache.get(user.id);
  if (cached && cached.expires > Date.now()) return cached.staff;
  const staff = await loadStaff(user.id);
  cache.set(user.id, { staff, expires: Date.now() + CACHE_MS });
  return staff;
}

async function loadStaff(userId: string): Promise<Staff | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
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

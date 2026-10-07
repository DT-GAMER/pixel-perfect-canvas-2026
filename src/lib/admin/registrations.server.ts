// Query builder for registrations, shared by the list and the CSV export. Server only.
import type { RegistrationFilters } from "./registrations";

type AdminClient = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

// Strip characters that have meaning in PostgREST filter syntax.
const searchTerm = (value: string) => value.replace(/[,()*%\\:"']/g, " ").trim();

export const REGISTRATION_COLUMNS =
  "id, full_name, email, profession, other_profession, country, city, subscribe_updates, privacy_agreed, confirmation_email_status, confirmation_email_sent_at, confirmation_email_error, created_at";

/** Filtered + sorted query; not awaited here (query builders run when awaited). */
export function filteredRegistrations(
  client: AdminClient,
  filters: RegistrationFilters,
  count = false,
) {
  let query = client
    .from("registrations")
    .select(REGISTRATION_COLUMNS, count ? { count: "exact" } : undefined);
  const term = filters.q ? searchTerm(filters.q) : "";
  if (term)
    query = query.or(`full_name.ilike.*${term}*,email.ilike.*${term}*,city.ilike.*${term}*`);
  if (filters.profession) query = query.eq("profession", filters.profession);
  if (filters.country) query = query.eq("country", filters.country);
  // Dates are calendar days in Lagos time (UTC+1).
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00+01:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999+01:00`);
  if (filters.subscribed) query = query.eq("subscribe_updates", filters.subscribed === "yes");
  if (filters.email) query = query.eq("confirmation_email_status", filters.email);
  return query
    .order(filters.sort ?? "created_at", { ascending: (filters.dir ?? "desc") === "asc" })
    .order("id");
}

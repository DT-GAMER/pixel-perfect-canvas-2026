import { createServerFn } from "@tanstack/react-start";

const DAYS = 30;
const lagosDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }); // YYYY-MM-DD
const dayLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function topCounts(values: string[], limit: number) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [registrations, posts, enquiries] = await Promise.all([
    supabaseAdmin
      .from("registrations")
      .select("created_at, profession, country, subscribe_updates, confirmation_email_status")
      .limit(20000),
    supabaseAdmin
      .from("blog_posts")
      .select("slug, title, status, published_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("sponsor_enquiries")
      .select("id, company, tier_interest, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  for (const result of [registrations, posts, enquiries]) {
    if (result.error) throw new Error(result.error.message);
  }
  const rows = registrations.data ?? [];

  // Daily sign-ups for the last 30 days, in Lagos time.
  const today = new Date(`${lagosDay.format(new Date())}T00:00:00Z`);
  const daily = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(today.getTime() - (DAYS - 1 - index) * 86_400_000);
    return { date: date.toISOString().slice(0, 10), label: dayLabel.format(date), count: 0 };
  });
  const byDate = new Map(daily.map((day) => [day.date, day]));
  for (const row of rows) {
    const day = byDate.get(lagosDay.format(new Date(row.created_at)));
    if (day) day.count++;
  }

  const weekAgo = Date.now() - 7 * 86_400_000;
  const allEnquiries = enquiries.data ?? [];

  return {
    totals: {
      registrations: rows.length,
      thisWeek: rows.filter((row) => new Date(row.created_at).getTime() >= weekAgo).length,
      subscribed: rows.filter((row) => row.subscribe_updates).length,
      emailFailed: rows.filter((row) => row.confirmation_email_status === "failed").length,
      newEnquiries: allEnquiries.filter((enquiry) => enquiry.status === "new").length,
    },
    daily,
    professions: topCounts(
      rows.map((row) => row.profession),
      6,
    ),
    countries: topCounts(
      rows.map((row) => row.country),
      6,
    ),
    posts: posts.data ?? [],
    enquiries: allEnquiries.slice(0, 5),
  };
});

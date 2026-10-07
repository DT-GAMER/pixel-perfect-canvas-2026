import { createFileRoute } from "@tanstack/react-router";
import { registrationFiltersSchema } from "@/lib/admin/registrations";

// Neutralise spreadsheet formulas (CSV injection) and quote every cell.
function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const COLUMNS: [string, string][] = [
  ["created_at", "Registered at (UTC)"],
  ["full_name", "Full name"],
  ["email", "Email"],
  ["profession", "Profession"],
  ["other_profession", "Other profession"],
  ["country", "Country"],
  ["city", "City"],
  ["subscribe_updates", "Subscribed to updates"],
  ["confirmation_email_status", "Confirmation email"],
];

// GET /admin/registrations.csv?<same filters as the table> — admins only.
export const Route = createFileRoute("/admin_/registrations.csv")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getStaffMember } = await import("@/lib/staff.server");
        const staff = await getStaffMember();
        if (staff?.role !== "admin") return new Response("Forbidden", { status: 403 });

        const params = Object.fromEntries(new URL(request.url).searchParams);
        const filters = registrationFiltersSchema.parse(params);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { filteredRegistrations } = await import("@/lib/admin/registrations.server");
        const { data, error } = await filteredRegistrations(supabaseAdmin, filters).limit(50000);
        if (error) return new Response("Export failed", { status: 500 });

        const lines = [
          COLUMNS.map(([, label]) => csvCell(label)).join(","),
          ...data.map((row) =>
            COLUMNS.map(([key]) => {
              const value = row[key as keyof typeof row];
              return csvCell(typeof value === "boolean" ? (value ? "Yes" : "No") : value);
            }).join(","),
          ),
        ];
        const date = new Date().toISOString().slice(0, 10);
        // BOM so Excel opens UTF-8 names correctly.
        return new Response(`﻿${lines.join("\r\n")}\r\n`, {
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": `attachment; filename="c8-registrations-${date}.csv"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});

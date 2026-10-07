import { redirect } from "@tanstack/react-router";
import type { Staff } from "@/lib/staff";

/** beforeLoad helper for admin-only pages: editors are sent to the blog. */
export function adminOnly({ context }: { context: { staff: Staff } }) {
  if (context.staff.role !== "admin") throw redirect({ to: "/admin/blog" });
}

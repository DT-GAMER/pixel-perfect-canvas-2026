import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { EVENT } from "@/lib/event";
import { getStaff } from "@/lib/staff.functions";

// Guarded layout for the whole dashboard. Server functions re-check roles too.
export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({
    meta: [
      { title: `Dashboard — ${EVENT.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff}>
      <Outlet />
    </AdminShell>
  );
}

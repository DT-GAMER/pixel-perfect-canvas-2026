import { createFileRoute } from "@tanstack/react-router";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { adminOnly } from "@/lib/admin/guards";
import { settingsEditorData } from "@/lib/admin/settings.functions";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: adminOnly,
  loader: () => settingsEditorData(),
  component: () => <SettingsAdmin data={Route.useLoaderData()} />,
});

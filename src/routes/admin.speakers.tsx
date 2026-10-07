import { createFileRoute } from "@tanstack/react-router";
import { SpeakersAdmin } from "@/components/admin/SpeakersAdmin";
import { adminOnly } from "@/lib/admin/guards";
import { speakersDashboard } from "@/lib/admin/speakers.functions";

export const Route = createFileRoute("/admin/speakers")({
  beforeLoad: adminOnly,
  loader: () => speakersDashboard(),
  component: () => <SpeakersAdmin speakers={Route.useLoaderData()} />,
});

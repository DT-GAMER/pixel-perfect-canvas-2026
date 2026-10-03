import { createFileRoute } from "@tanstack/react-router";
import { PageStub } from "@/components/site/PageStub";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — C8 Tech Summit" },
      { name: "description", content: "Blog at C8 Tech Summit, 15 December 2026, Lagos." },
      { property: "og:title", content: "Blog — C8 Tech Summit" },
      { property: "og:description", content: "Blog at C8 Tech Summit, 15 December 2026, Lagos." },
    ],
  }),
  component: () => <PageStub title="Blog" note="Articles arrive in Phase 4." />,
});

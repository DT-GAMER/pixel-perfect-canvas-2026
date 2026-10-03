import { createFileRoute } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { Arcs } from "@/components/site/Logo";
import { btnPrimary } from "@/components/site/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${EVENT.name} — ${EVENT.tagline}` },
      { name: "description", content: `${EVENT.name}: ${EVENT.tagline}. ${EVENT.dateLabel}, ${EVENT.venue}.` },
      { property: "og:title", content: `${EVENT.name} — ${EVENT.tagline}` },
      { property: "og:description", content: `${EVENT.dateLabel}, ${EVENT.venue}.` },
    ],
  }),
  component: Index,
});

// Phase 1 placeholder — full homepage sections arrive in Phase 2.
function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-deep-blue text-paper">
        <Arcs className="arc-spin pointer-events-none absolute -right-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-80 md:-right-10" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 md:py-40">
          <p className="font-display font-semibold text-digital-lime">{EVENT.dateLabel} · {EVENT.venue}</p>
          <h1 className="mt-4 max-w-3xl text-h1">{EVENT.name}</h1>
          <p className="mt-4 max-w-xl text-paper/85">{EVENT.tagline}</p>
          <button type="button" data-register className={`${btnPrimary} mt-8`}>Register</button>
        </div>
      </section>
      <section id="about" className="bg-paper"><div className="mx-auto max-w-7xl px-5 py-20"><h2 className="text-h2 text-deep-blue">About</h2><p className="mt-3 text-muted-foreground">Coming in Phase 2.</p></div></section>
      <section id="theme" className="bg-digital-teal text-deep-blue"><div className="mx-auto max-w-7xl px-5 py-20"><h2 className="text-h2">Theme</h2><p className="mt-3">Coming in Phase 2.</p></div></section>
      <section id="faq" className="bg-light-grey"><div className="mx-auto max-w-7xl px-5 py-20"><h2 className="text-h2 text-deep-blue">FAQ</h2><p className="mt-3 text-muted-foreground">Coming in Phase 2.</p></div></section>
    </>
  );
}

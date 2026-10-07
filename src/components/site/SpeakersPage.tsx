import { Link } from "@tanstack/react-router";
import type { Speaker } from "@/lib/speakers.functions";
import { TRACKS } from "@/lib/tracks";
import { Arcs } from "./Logo";
import { SpeakerCard } from "./SpeakerCard";

const chip =
  "inline-flex min-h-12 items-center rounded-full border-2 px-5 font-display font-semibold transition";
const chipState = (active: boolean) =>
  active
    ? "border-deep-blue bg-deep-blue text-paper"
    : "border-deep-blue/25 text-deep-blue hover:border-deep-blue";

export function SpeakersPage({ speakers, track }: { speakers: Speaker[]; track: string | null }) {
  const shown = track ? speakers.filter((speaker) => speaker.track === track) : speakers;

  return (
    <>
      <section className="relative overflow-hidden bg-deep-blue py-20 text-paper md:py-28">
        <Arcs className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase text-digital-lime">Speakers</p>
          <h1 className="mt-4 max-w-4xl text-h1">Voices shaping the conversation.</h1>
          <p className="mt-6 max-w-2xl text-lg text-paper/80">
            Emerging and established builders, experts, and founders on what AI means for Nigerian
            jobs, privacy, and financial security. More speakers are being announced.
          </p>
        </div>
      </section>

      <section className="bg-light-grey py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <nav aria-label="Filter speakers by conversation" className="flex flex-wrap gap-3">
            <Link
              to="/speakers"
              search={{}}
              className={`${chip} ${chipState(!track)}`}
              aria-current={!track ? "page" : undefined}
            >
              All
            </Link>
            {TRACKS.map((item) => (
              <Link
                key={item.slug}
                to="/speakers"
                search={{ track: item.slug }}
                className={`${chip} ${chipState(track === item.slug)}`}
                aria-current={track === item.slug ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {shown.length === 0 ? (
            <p className="mt-14 text-lg text-muted-foreground">
              Speakers for this conversation will be announced soon.
            </p>
          ) : (
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((speaker) => (
                <SpeakerCard key={speaker.slug} speaker={speaker} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

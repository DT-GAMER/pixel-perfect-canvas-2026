import { Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Speaker } from "@/lib/speakers.functions";
import { trackName } from "@/lib/tracks";
import { Arcs } from "./Logo";

const SOCIAL_ICONS = { LinkedIn: Linkedin, X: Twitter, Instagram, Website: Globe } as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => /^[A-Z]/.test(part) && !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

const isAnnounced = (speaker: Speaker) => speaker.name !== "To be announced";

/** Photo in the brand's arch mask; arcs + initials when there's no photo yet. */
function SpeakerPhoto({ speaker, className = "" }: { speaker: Speaker; className?: string }) {
  if (speaker.photoUrl) {
    return (
      <img
        src={speaker.photoUrl}
        alt={speaker.photoAlt ?? ""}
        loading="lazy"
        width={800}
        height={1000}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <span className="relative flex h-full w-full items-center justify-center overflow-hidden bg-deep-blue">
      <Arcs className="absolute h-[140%] w-[140%] opacity-40" />
      <span
        className="relative font-display text-5xl font-bold text-digital-lime"
        aria-hidden="true"
      >
        {isAnnounced(speaker) ? initials(speaker.name) : "?"}
      </span>
    </span>
  );
}

/** Grid card that opens the speaker's profile. Photos are grayscale until hover/focus. */
export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [open, setOpen] = useState(false);
  const track = trackName(speaker.track);
  const announced = isAnnounced(speaker);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) document.body.dataset["modalOpen"] = "true";
    else delete document.body.dataset["modalOpen"];
  };

  // DialogTrigger lets Radix return focus to this card when the profile closes.
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger className="reveal group block w-full rounded-md text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-signal-orange">
        <span className="block aspect-[4/5] overflow-hidden rounded-t-[50%] bg-paper">
          <SpeakerPhoto
            speaker={speaker}
            className="grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-focus-visible:grayscale-0"
          />
        </span>
        {track && (
          <span className="mt-5 block font-display text-sm font-bold uppercase text-teal-ink">
            {track}
          </span>
        )}
        <span className="mt-2 block font-display text-2xl font-bold text-deep-blue">
          {speaker.name}
        </span>
        <span className="mt-1 block text-muted-foreground">
          {announced
            ? [speaker.role, speaker.organization].filter(Boolean).join(" · ")
            : "Announcing soon"}
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] max-w-3xl overflow-y-auto border-0 bg-paper p-0 text-ink sm:rounded-md">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="aspect-[4/5] md:aspect-auto">
            <SpeakerPhoto speaker={speaker} />
          </div>
          <div className="p-8 md:p-10">
            {track && (
              <p className="font-display text-sm font-bold uppercase text-teal-ink">{track}</p>
            )}
            <DialogTitle className="mt-3 text-h2 text-deep-blue">{speaker.name}</DialogTitle>
            {announced && (
              <p className="mt-3 font-display font-semibold text-ink">
                {[speaker.role, speaker.organization].filter(Boolean).join(" · ")}
              </p>
            )}
            <DialogDescription className="mt-6 text-base text-muted-foreground">
              {speaker.bio ?? "Full biography coming soon."}
            </DialogDescription>
            {speaker.socials.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-3" aria-label={`${speaker.name} online`}>
                {speaker.socials.map(({ label, href }) => {
                  const Icon = SOCIAL_ICONS[label];
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-deep-blue/20 px-5 font-display font-semibold text-deep-blue transition hover:border-deep-blue"
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" /> {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

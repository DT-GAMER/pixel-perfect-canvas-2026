import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

export function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    done: diff === 0,
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
    now,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

// Hidden under 400px, and whenever <body data-modal-open> is set.
export function CountdownPill() {
  const t = useCountdown(EVENT.startsAt);
  if (!t) return null;
  if (t.now > new Date(EVENT.endsAt).getTime()) return null;
  return (
    <aside
      aria-label="Event countdown"
      className="fixed bottom-4 right-4 z-30 hidden rounded-full bg-deep-blue px-5 py-3 font-display font-bold text-paper shadow-lg min-[400px]:block [body[data-modal-open]_&]:hidden"
    >
      <div role="timer" aria-label="Time until the event">
        {t.done ? (
          <span className="text-digital-lime">● Happening now</span>
        ) : (
          <span className="tabular-nums">
            <span className="text-digital-lime">{t.d}d</span> {pad(t.h)}h {pad(t.m)}m {pad(t.s)}s
          </span>
        )}
      </div>
    </aside>
  );
}

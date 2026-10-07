import { Link } from "@tanstack/react-router";
import { EVENT } from "@/lib/event";
import { btnPrimary } from "./Header";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3">
        <div>
          <h2 className="text-h3">Don't miss {EVENT.name}</h2>
          <p className="mt-3 text-paper/80">
            {EVENT.dateLabel} · {EVENT.venue}
          </p>
          <Button type="button" data-register className={`${btnPrimary} mt-6`}>
            Register now
          </Button>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 font-display">
          <Link to="/speakers" className="hover:text-digital-lime">
            Speakers
          </Link>
          <Link to="/blog" className="hover:text-digital-lime">
            Blog
          </Link>
          <Link to="/sponsors" className="hover:text-digital-lime">
            Sponsors
          </Link>
          <Link to="/privacy" className="hover:text-digital-lime">
            Privacy policy
          </Link>
        </nav>
        <div className="flex flex-col gap-2">
          <a href={`mailto:${EVENT.email}`} className="font-display hover:text-digital-lime">
            {EVENT.email}
          </a>
          {EVENT.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-digital-lime"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-5 pb-4 text-sm text-paper/60">
        © {new Date().getFullYear()} {EVENT.name}. All rights reserved.
      </p>
      {/* Decorative cropped wordmark, drawn as SVG so it reads as a graphic, not text. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1000 150"
        className="block w-full select-none"
      >
        <text
          x="500"
          y="172"
          textAnchor="middle"
          textLength="990"
          lengthAdjust="spacingAndGlyphs"
          fontSize="200"
          className="fill-deep-blue font-display font-bold"
        >
          {EVENT.name}
        </text>
      </svg>
    </footer>
  );
}

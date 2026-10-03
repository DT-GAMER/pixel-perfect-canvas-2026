import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./Logo";
import { EVENT } from "@/lib/event";

const links = [
  { label: "About", to: "/", hash: "about" },
  { label: "Theme", to: "/", hash: "theme" },
  { label: "Speakers", to: "/speakers" },
  { label: "Blog", to: "/blog" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "FAQ", to: "/", hash: "faq" },
] as const;

export const btnPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-signal-orange px-6 font-display font-bold text-deep-blue transition hover:-translate-y-0.5 hover:brightness-110";
export const btnOutline =
  "inline-flex min-h-12 items-center justify-center rounded-full border-2 border-current px-6 font-display font-semibold transition hover:bg-paper hover:text-deep-blue";

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-deep-blue text-paper">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-3 font-display text-lg font-bold">
          <LogoMark />
          <span>{EVENT.name}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 font-display font-medium lg:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} hash={"hash" in l ? l.hash : undefined} className="hover:text-digital-lime">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/sponsors" className={btnOutline}>Become a Sponsor</Link>
          <button type="button" data-register className={btnPrimary}>Register</button>
        </div>
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-20 z-40 flex flex-col gap-2 overflow-y-auto bg-deep-blue px-5 py-8 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              onClick={() => setOpen(false)}
              className="py-3 font-display text-h3 font-bold hover:text-digital-lime"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/sponsors" onClick={() => setOpen(false)} className={btnOutline}>Become a Sponsor</Link>
            <button type="button" data-register className={btnPrimary}>Register</button>
          </div>
        </div>
      )}
    </header>
  );
}

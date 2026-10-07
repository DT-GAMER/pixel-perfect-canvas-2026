// Event facts used across the site, metadata, and emails.
//
// Values come from the site_settings table (edited in the dashboard). The server
// refreshes them per request (cached briefly, see settings.server.ts); the
// browser receives the same values from the root route's loader. Until then,
// the defaults below apply. Labels (date, time, edition) derive from startsAt
// so they can never disagree with the countdown.

export type Stat = { value: number; suffix: string; label: string };

export type SiteSettings = {
  name: string;
  tagline: string;
  theme: string;
  themeShort: string;
  venue: string;
  format: string;
  startsAt: string;
  endsAt: string;
  email: string;
  xUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  stats: Stat[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "C8 Tech Summit",
  tagline: "Connecting tech entrepreneurs",
  theme: "Navigating Nigeria's AI Revolution: Jobs, Privacy, & Financial Security",
  themeShort: "Navigating Nigeria's AI Revolution",
  venue: "Live online",
  format: "Virtual summit",
  startsAt: "2026-10-15T16:00:00+01:00",
  endsAt: "2026-10-15T18:00:00+01:00",
  email: "C8techsummit@gmail.com",
  xUrl: "https://x.com/c8techsummit?s=21",
  linkedinUrl: "https://www.linkedin.com/company/c8-tech-summit/",
  instagramUrl: "https://www.instagram.com/c8techsummit?stkn=MWdyemZiMmxzODhydA==",
  stats: [],
};

const settings: SiteSettings = { ...DEFAULT_SETTINGS };

/** Replaces the current settings (server: per request; browser: from the root loader). */
export function applySettings(next: SiteSettings) {
  Object.assign(settings, next);
}

const LAGOS = "Africa/Lagos";
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: LAGOS,
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: LAGOS,
});
const yearFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: LAGOS });

export const EVENT = {
  get name() {
    return settings.name;
  },
  get tagline() {
    return settings.tagline;
  },
  get theme() {
    return settings.theme;
  },
  get themeShort() {
    return settings.themeShort;
  },
  get venue() {
    return settings.venue;
  },
  get format() {
    return settings.format;
  },
  get startsAt() {
    return settings.startsAt;
  },
  get endsAt() {
    return settings.endsAt;
  },
  get email() {
    return settings.email;
  },
  get stats() {
    return settings.stats;
  },
  /** "2026" */
  get edition() {
    return yearFormat.format(new Date(settings.startsAt));
  },
  /** "15 October 2026" */
  get dateLabel() {
    return dateFormat.format(new Date(settings.startsAt));
  },
  /** "4:00 PM WAT" */
  get timeLabel() {
    return `${timeFormat.format(new Date(settings.startsAt))} WAT`;
  },
  get socials() {
    return [
      { label: "X / Twitter", href: settings.xUrl },
      { label: "LinkedIn", href: settings.linkedinUrl },
      { label: "Instagram", href: settings.instagramUrl },
    ].filter((social): social is { label: string; href: string } => !!social.href);
  },
  mission:
    "Bringing Nigeria's tech community together, emerging and established, through conversations, connections, and opportunities.",
};

/** "15 October 2026 · 4:00 PM WAT · Live online" */
export const eventWhenWhere = () => `${EVENT.dateLabel} · ${EVENT.timeLabel} · ${EVENT.venue}`;

// Event facts used across the site, metadata and emails.
// Will move to admin-editable site settings in Phase 6.
export const EVENT = {
  name: "C8 Tech Summit",
  edition: "2026",
  tagline: "Connecting tech entrepreneurs",
  theme: "Navigating Nigeria's AI Revolution: Jobs, Privacy, & Financial Security",
  themeShort: "Navigating Nigeria's AI Revolution",
  mission:
    "Bringing Nigeria's tech community together, emerging and established, through conversations, connections, and opportunities.",
  dateLabel: "15 October 2026",
  timeLabel: "4:00 PM WAT",
  venue: "Live online",
  // Joining details are emailed to registrants before the event.
  format: "Virtual summit",
  startsAt: "2026-10-15T16:00:00+01:00",
  // End time not yet confirmed; drives the "Happening now" pill and calendar invites.
  endsAt: "2026-10-15T18:00:00+01:00",
  email: "C8techsummit@gmail.com",
  socials: [
    { label: "X / Twitter", href: "https://x.com/c8techsummit?s=21" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/c8-tech-summit/" },
    {
      label: "Instagram",
      href: "https://www.instagram.com/c8techsummit?stkn=MWdyemZiMmxzODhydA==",
    },
  ],
};

/** "15 October 2026 · 4:00 PM WAT · Live online" */
export const EVENT_WHEN_WHERE = `${EVENT.dateLabel} · ${EVENT.timeLabel} · ${EVENT.venue}`;

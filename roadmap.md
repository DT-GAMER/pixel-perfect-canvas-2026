# Roadmap

- [x] Detach from Lovable: standalone Vite config, local assets, npm, Node server build
- [x] Local stack with Docker Compose (app + self-hosted Supabase + Mailpit) and migration runner

- [x] Apply confirmed contact details, schedule, official logos, and favicon
- [x] Build every Phase 2 homepage section with placeholder content
- [x] Add homepage animations, speaker modal, and FAQ interaction
- [x] Verify desktop and mobile presentation, metadata, and build status
- [x] Enable Cloud and create secure registration storage with persistent rate limiting
- [x] Build the accessible registration modal and connect every Register button
- [x] Add server and browser validation, duplicate handling, spam protection, and success states
- [x] Confirmation email via Resend (Mailpit locally) with calendar invite and delivery status per registration
- [x] Update site copy for the 2026 theme, virtual format, and 15 October 2026 4:00 PM WAT date
- [x] Full country list, spoof-resistant rate limiting, plain-language privacy policy
- [x] Tech, marketing, and leadership profession list (grouped dropdown)
- [ ] Add Resend API key and verified sending domain for production
- [x] Verify registration storage, duplicate behavior, keyboard access, and responsive presentation

## Phase 4 — Blog

- [x] `categories` and `blog_posts` tables with RLS; article bodies withheld from the public API
- [x] `/blog` with category filters and pagination; homepage shows the three latest posts
- [x] `/blog/[slug]` with server-enforced preview, fade, and sign-up wall reusing the registration form
- [x] Magic-link reader sign-in via Resend, httpOnly cookie session, sign-out, expired-link handling
- [x] Free posts, scheduled publishing, per-post SEO metadata
- [x] RSS feed at `/rss.xml` (no gated text)
- [x] Sample categories and posts on the 2026 theme
- [ ] Replace sample posts with real articles (admin editor in Phase 6)

## Phase 5 — Speakers and sponsors

- [x] `speakers`, `sponsors`, `sponsor_enquiries` tables with RLS
- [x] `/speakers` with conversation filters; accessible profile dialog with social links
- [x] Homepage featured speakers and sponsor strip from the database
- [x] `/sponsors` with tiered partners, open-slot cards, "Why sponsor us", campaign targets
- [x] Sponsor enquiry form: validation, honeypot, rate limiting, team notification + acknowledgement emails
- [ ] Real speaker lineup (names, roles, bios, photos, socials, conversation)
- [ ] Real sponsors (logos, links, tiers, descriptions)

## Phase 6 — Admin dashboard

- [x] Staff roles (admin/editor), magic-link login, guarded dashboard, server-side role checks
- [x] Overview: totals, sign-ups chart, top professions/countries, latest posts, enquiries
- [x] Registrations: search, filters, sorting, details, delete, CSV export
- [x] Sponsors (logo upload, tiers, visibility, drag-and-drop order) and enquiries (status, notes)
- [x] Speakers: photo upload, socials, track, featured/published, ordering
- [x] Blog: Tiptap editor, cover upload, gating, scheduling, SEO, preview
- [x] FAQ: add/edit/reorder/hide; homepage reads from the database
- [x] Site settings: event details and dates (drive countdown/emails), stats, socials, privacy policy
- [x] Team: invite, change roles, remove access
- [ ] Create the first real admin account (`npm run admin:create`)


# Phase 3: Registration and confirmation

## What I’ll build
- Enable Lovable Cloud and add a secure `registrations` table with duplicate-email protection and private access.
- Add one accessible registration modal used by every Register button across the site.
- Include all required fields, profession-dependent “Other” input, privacy consent, optional updates consent, validation, honeypot protection, and rate limiting.
- Save valid registrations on the server and return friendly duplicate, validation, spam, and rate-limit messages.
- Add the in-modal success state and confirmation-email delivery when the project’s email domain is ready.
- Verify desktop and mobile interaction, keyboard behavior, duplicate handling, stored data, and delivery status.

## Registration experience
- The form opens from the header, mobile menu, homepage, and footer.
- The modal traps focus, closes with Escape or its close control, and hides the floating countdown while open.
- Country is a searchable/selectable list; city is free text.
- Privacy policy agreement is required and links to the existing privacy page.

## Technical details
- Inputs are validated with Zod in the browser and again in a TanStack server function.
- The database keeps visitor registrations unreadable to the public; trusted server code performs inserts.
- Duplicate detection uses a normalized, case-insensitive email value enforced by the database.
- Rate limiting uses persistent server-side records rather than browser-only state.
- Confirmation email is only marked complete after a verified domain and successful delivery log are confirmed.

## Phase boundary
Phase 3 ends after registration is stored and tested. Blog gating, magic-link reader login, and admin registration management remain in Phases 4 and 6.

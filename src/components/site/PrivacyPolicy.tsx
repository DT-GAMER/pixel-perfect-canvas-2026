import type { ReactNode } from "react";
import { EVENT } from "@/lib/event";

// Plain-language policy describing what the site actually collects today.
// Becomes admin-editable in Phase 6; have it reviewed before launch.
const LAST_UPDATED = "7 October 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-h3 text-deep-blue">{title}</h2>
      <div className="mt-4 space-y-4 text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPolicy() {
  const mail = (
    <a href={`mailto:${EVENT.email}`} className="font-semibold text-deep-blue underline">
      {EVENT.email}
    </a>
  );

  return (
    <article className="bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <p className="font-display text-sm font-bold uppercase text-digital-teal">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="mt-4 text-h1 text-deep-blue">Privacy policy</h1>
        <p className="mt-6 text-lg text-ink">
          {EVENT.name} respects your privacy. This policy explains what personal information we
          collect when you register for or interact with {EVENT.name}, why we collect it, and the
          choices you have.
        </p>

        <Section title="What we collect">
          <p>When you register, we collect:</p>
          <ul>
            <li>your full name and email address</li>
            <li>your profession</li>
            <li>your country and city</li>
            <li>
              whether you agreed to this policy, and whether you want news and programme updates
            </li>
          </ul>
          <p>
            To protect the form from spam and abuse, we also briefly process a one-way,
            non-reversible fingerprint of your IP address to limit repeated attempts. We do not
            store your IP address itself.
          </p>
        </Section>

        <Section title="How we use it">
          <ul>
            <li>
              to confirm your registration and send your joining link, reminders, and essential
              event information
            </li>
            <li>
              to understand who our community is (for example, the mix of professions and locations)
              so we can plan better events
            </li>
            <li>
              if you opted in, to send you news about future C8 Tech Summit events and programmes
            </li>
          </ul>
          <p>We do not sell your personal information.</p>
        </Section>

        <Section title="Who we share it with">
          <p>
            We use trusted service providers to run the event: a database and hosting provider to
            store registrations, and an email delivery provider (Resend) to send confirmations and
            updates. They process your information only on our behalf. If speakers, sponsors, or
            partners want to contact attendees, we will ask for your consent first.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep registration details for as long as needed to run this year's summit and follow
            up afterwards. If you opted in to updates, we keep your contact details until you
            unsubscribe. You can ask us to delete your information at any time.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            In line with the Nigeria Data Protection Act 2023 and other applicable laws, you can ask
            to access, correct, or delete your personal information, withdraw your consent to
            updates, or object to how we use it. Email {mail} and we will respond as quickly as we
            can.
          </p>
        </Section>

        <Section title="Contact">
          <p>Questions about this policy or your information? Email {mail}.</p>
        </Section>
      </div>
    </article>
  );
}

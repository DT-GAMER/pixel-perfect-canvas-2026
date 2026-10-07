// Registration confirmation email: HTML + plain text + calendar invite. Server only.
import { EVENT } from "./event";
import type { EmailMessage } from "./email.server";
import {
  COLORS,
  emailButton,
  emailHeading,
  emailLayout,
  emailParagraph,
  escapeHtml,
  firstName,
  siteUrl,
  textFooter,
} from "./email-layout.server";

type Registrant = {
  id: string;
  fullName: string;
  email: string;
  /** Magic link to keep reading, when they registered from a blog sign-up wall. */
  readLink?: string | undefined;
};

/** 2026-10-15T15:00:00.000Z → 20261015T150000Z */
const icsDate = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** RFC 5545 text escaping. */
const icsText = (value: string) =>
  value.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, "\\n");

const eventDescription = () =>
  `${EVENT.edition} theme: ${EVENT.theme}. Your joining link will be emailed before the event.`;

function calendarInvite(registrant: Registrant) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//C8 Tech Summit//Registration//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${registrant.id}@c8techsummit`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(EVENT.startsAt)}`,
    `DTEND:${icsDate(EVENT.endsAt)}`,
    `SUMMARY:${icsText(`${EVENT.name} ${EVENT.edition}`)}`,
    `DESCRIPTION:${icsText(eventDescription())}`,
    `LOCATION:${icsText(`${EVENT.venue} (joining link by email)`)}`,
    `URL:${siteUrl()}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** RFC 5545 §3.1: lines longer than 75 characters continue on the next line after a space. */
function foldIcsLine(line: string) {
  const chunks = [];
  for (let start = 0; start < line.length; start += start === 0 ? 75 : 74) {
    chunks.push(line.slice(start, start === 0 ? 75 : start + 74));
  }
  return chunks.join("\r\n ");
}

function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.name} ${EVENT.edition}`,
    dates: `${icsDate(EVENT.startsAt)}/${icsDate(EVENT.endsAt)}`,
    details: eventDescription(),
    location: EVENT.venue,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function registrationConfirmationEmail(registrant: Registrant): EmailMessage {
  const name = firstName(registrant.fullName);
  const calendarUrl = googleCalendarUrl();
  const subject = `You're registered for ${EVENT.name} ${EVENT.edition}`;
  const { readLink } = registrant;

  const text = [
    `Hi ${name},`,
    "",
    `You're registered for ${EVENT.name} ${EVENT.edition}. Thank you for joining us.`,
    "",
    ...(readLink
      ? ["Continue reading (this sign-in link works once and expires in 1 hour):", readLink, ""]
      : []),
    `Theme: ${EVENT.theme}`,
    `Date: ${EVENT.dateLabel}`,
    `Time: ${EVENT.timeLabel}`,
    `Where: ${EVENT.venue}`,
    "",
    "What happens next:",
    "- We'll email your joining link to this address before the event.",
    "- A calendar invite is attached. Add it so you don't miss the start.",
    `- Add to Google Calendar: ${calendarUrl}`,
    "",
    "We're bringing the AI conversation home: what AI means for Nigerian jobs, data privacy, businesses, and everyday life. Bring your questions.",
    "",
    textFooter(),
  ].join("\n");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.grey};font-size:14px;color:#5b6070;width:88px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.grey};font-size:16px;font-weight:600;color:${COLORS.ink};">${escapeHtml(value)}</td>
    </tr>`;

  const readBlock = readLink
    ? `${emailButton(readLink, "Continue reading", "secondary")}
       <p style="margin:12px 0 28px;font-size:14px;line-height:1.6;color:#5b6070;">This sign-in link works once and expires in 1 hour. After that, you'll stay signed in on that device.</p>`
    : "";

  const html = emailLayout({
    subject,
    preheader: `Your place is confirmed: ${EVENT.dateLabel}, ${EVENT.timeLabel}, ${EVENT.venue}.`,
    eyebrow: "Registration confirmed",
    heading: `You're in, ${escapeHtml(name)}.`,
    subheading: `${EVENT.name} ${EVENT.edition}: ${EVENT.theme}`,
    reason: "You're receiving this because you registered at",
    body: `
      ${emailParagraph("Thank you for registering. We're bringing the AI conversation home: what AI means for Nigerian jobs, data privacy, businesses, and everyday life. Bring your questions.")}
      ${readBlock}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Date", EVENT.dateLabel)}
        ${row("Time", EVENT.timeLabel)}
        ${row("Where", `${EVENT.venue}, joining link by email`)}
      </table>
      ${emailHeading("What happens next")}
      <ul style="margin:0;padding-left:20px;font-size:16px;line-height:1.6;">
        <li>We'll email your joining link to this address before the event.</li>
        <li>A calendar invite is attached. Add it so you don't miss the start.</li>
      </ul>
      ${emailButton(calendarUrl, "Add to Google Calendar")}`,
  });

  return {
    to: registrant.email,
    subject,
    html,
    text,
    attachments: [
      {
        filename: "c8-tech-summit.ics",
        content: calendarInvite(registrant),
        contentType: "text/calendar; charset=utf-8; method=PUBLISH",
      },
    ],
    idempotencyKey: `registration-confirmation/${registrant.id}`,
  };
}

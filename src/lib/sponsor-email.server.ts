// Sponsor enquiry emails: team notification and enquirer acknowledgement. Server only.
import { EVENT } from "./event";
import type { EmailMessage } from "./email.server";
import {
  COLORS,
  emailLayout,
  emailParagraph,
  escapeHtml,
  firstName,
  textFooter,
} from "./email-layout.server";
import { tierName, type SponsorEnquiryInput } from "./sponsorship";

type Enquiry = Omit<SponsorEnquiryInput, "website"> & { id: string };

/** Where enquiries are sent. Defaults to the public contact address. */
export const enquiryInbox = () => process.env["SPONSOR_ENQUIRY_EMAIL"]?.trim() || EVENT.email;

export function sponsorEnquiryNotification(enquiry: Enquiry): EmailMessage {
  const tier = tierName(enquiry.tierInterest);
  const subject = `Sponsor enquiry: ${enquiry.company} (${tier})`;
  const fields: [string, string][] = [
    ["Name", enquiry.name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "Not given"],
    ["Tier", tier],
  ];

  const text = [
    `New sponsor enquiry for ${EVENT.name} ${EVENT.edition}.`,
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    enquiry.message,
    "",
    "Reply to this email to answer them directly.",
  ].join("\n");

  const rows = fields
    .map(
      ([label, value]) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.grey};font-size:14px;color:#5b6070;width:96px;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.grey};font-size:16px;font-weight:600;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  const html = emailLayout({
    subject,
    preheader: `${enquiry.company} is interested in ${tier}.`,
    eyebrow: "Sponsor enquiry",
    heading: escapeHtml(enquiry.company),
    subheading: `Interested in: ${tier}`,
    reason: "Sent to the C8 team from the sponsor form at",
    body: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      <p style="margin:24px 0 8px;font-size:14px;color:#5b6070;">Message</p>
      <p style="margin:0;font-size:16px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</p>
      <p style="margin:24px 0 0;font-size:14px;color:#5b6070;">Reply to this email to answer ${escapeHtml(firstName(enquiry.name))} directly.</p>`,
  });

  return {
    to: enquiryInbox(),
    subject,
    html,
    text,
    replyTo: enquiry.email,
    idempotencyKey: `sponsor-enquiry/${enquiry.id}`,
  };
}

export function sponsorEnquiryAcknowledgement(enquiry: Enquiry): EmailMessage {
  const name = firstName(enquiry.name);
  const subject = `Thanks for your interest in sponsoring ${EVENT.name}`;
  const text = [
    `Hi ${name},`,
    "",
    `Thank you for your interest in partnering with ${EVENT.name} ${EVENT.edition}. We've received your enquiry for ${enquiry.company} and will be in touch shortly.`,
    "",
    `The summit takes place ${EVENT.dateLabel} at ${EVENT.timeLabel}, ${EVENT.venue.toLowerCase()}.`,
    "",
    textFooter(),
  ].join("\n");

  const html = emailLayout({
    subject,
    preheader: "We've received your sponsorship enquiry.",
    eyebrow: "Enquiry received",
    heading: `Thank you, ${escapeHtml(name)}.`,
    subheading: `${EVENT.name} ${EVENT.edition}: ${EVENT.theme}`,
    reason: "You're receiving this because you sent a sponsorship enquiry at",
    body: `
      ${emailParagraph(`We've received your enquiry for <strong>${escapeHtml(enquiry.company)}</strong> and will be in touch shortly to talk through how we can work together.`)}
      ${emailParagraph(`The summit takes place ${escapeHtml(EVENT.dateLabel)} at ${escapeHtml(EVENT.timeLabel)}, ${escapeHtml(EVENT.venue.toLowerCase())}. In the meantime, reply to this email with anything else you'd like us to know.`)}`,
  });

  return {
    to: enquiry.email,
    subject,
    html,
    text,
    idempotencyKey: `sponsor-enquiry-ack/${enquiry.id}`,
  };
}

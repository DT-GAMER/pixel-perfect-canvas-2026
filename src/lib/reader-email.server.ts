// Magic sign-in link email for blog readers. Server only.
import { EVENT } from "./event";
import type { EmailMessage } from "./email.server";
import { emailButton, emailLayout, emailParagraph, textFooter } from "./email-layout.server";

export function readerSignInEmail(email: string, link: string): EmailMessage {
  const subject = `Your ${EVENT.name} sign-in link`;
  const text = [
    "Hi,",
    "",
    `Use this link to sign in and keep reading on ${EVENT.name}:`,
    link,
    "",
    "It works once and expires in 1 hour. After that, you'll stay signed in on that device.",
    "If you didn't ask for this, you can ignore this email.",
    "",
    textFooter(),
  ].join("\n");

  const html = emailLayout({
    subject,
    preheader: "Your sign-in link is inside. It expires in 1 hour.",
    eyebrow: "Sign in",
    heading: "Pick up where you left off.",
    reason: "You're receiving this because someone asked for a sign-in link at",
    body: `
      ${emailParagraph(`Use the button below to sign in and read every article on ${EVENT.name}.`)}
      ${emailButton(link, "Sign in and keep reading")}
      <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#5b6070;">This link works once and expires in 1 hour. After that, you'll stay signed in on that device. If you didn't ask for it, you can ignore this email.</p>`,
  });

  return { to: email, subject, html, text };
}

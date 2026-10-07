// Magic sign-in link email for blog readers. Server only.
import { EVENT } from "./event";
import type { EmailMessage } from "./email.server";
import {
  emailButton,
  emailLayout,
  emailParagraph,
  escapeHtml,
  siteUrl,
  textFooter,
} from "./email-layout.server";

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

export function staffSignInEmail(email: string, link: string): EmailMessage {
  const subject = `Your ${EVENT.name} dashboard sign-in link`;
  const text = [
    "Hi,",
    "",
    `Use this link to sign in to the ${EVENT.name} admin dashboard:`,
    link,
    "",
    "It works once and expires in 1 hour. If you didn't ask for it, you can ignore this email.",
    "",
    textFooter(),
  ].join("\n");

  const html = emailLayout({
    subject,
    preheader: "Your dashboard sign-in link is inside. It expires in 1 hour.",
    eyebrow: "Admin dashboard",
    heading: "Sign in to the dashboard.",
    reason: "You're receiving this because someone asked for a dashboard sign-in link at",
    body: `
      ${emailParagraph(`Use the button below to sign in to the ${EVENT.name} admin dashboard.`)}
      ${emailButton(link, "Sign in to the dashboard")}
      <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#5b6070;">This link works once and expires in 1 hour. If you didn't ask for it, you can ignore this email.</p>`,
  });

  return { to: email, subject, html, text };
}

export function staffInviteEmail(
  email: string,
  link: string,
  role: "admin" | "editor",
  invitedBy: string,
): EmailMessage {
  const what = role === "admin" ? "manage the site and team" : "write and publish blog posts";
  const subject = `You've been invited to the ${EVENT.name} dashboard`;
  const text = [
    "Hi,",
    "",
    `${invitedBy} has invited you to the ${EVENT.name} dashboard as ${role === "admin" ? "an admin" : "an editor"}, so you can ${what}.`,
    "",
    "Sign in with this link (it works once and expires in 1 hour):",
    link,
    "",
    `Afterwards, sign in any time at ${siteUrl()}/admin/login with this email address.`,
    "",
    textFooter(),
  ].join("\n");

  const html = emailLayout({
    subject,
    preheader: `${invitedBy} invited you as ${role === "admin" ? "an admin" : "an editor"}.`,
    eyebrow: "Team invitation",
    heading: "You're invited to the dashboard.",
    reason: "You're receiving this because a team admin invited you at",
    body: `
      ${emailParagraph(`${escapeHtml(invitedBy)} has invited you to the ${escapeHtml(EVENT.name)} dashboard as <strong>${role === "admin" ? "an admin" : "an editor"}</strong>, so you can ${what}.`)}
      ${emailButton(link, "Accept and sign in")}
      <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#5b6070;">This link works once and expires in 1 hour. Afterwards, sign in any time at ${escapeHtml(siteUrl())}/admin/login with this email address.</p>`,
  });

  return { to: email, subject, html, text };
}

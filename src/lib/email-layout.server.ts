// Shared branded shell and helpers for transactional emails. Server only.
import { EVENT } from "./event";
import { siteUrl } from "./site-url.server";

export const COLORS = {
  deepBlue: "#001F65",
  lime: "#B8E600",
  orange: "#FF6B35",
  grey: "#EBEAE7",
  ink: "#0B0F1A",
};

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export { siteUrl } from "./site-url.server";

export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

/** Bulletproof pill button. Orange (primary) or deep blue (secondary). */
export function emailButton(
  href: string,
  label: string,
  variant: "primary" | "secondary" = "primary",
) {
  const background = variant === "primary" ? COLORS.orange : COLORS.deepBlue;
  const color = variant === "primary" ? COLORS.deepBlue : "#ffffff";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="border-radius:999px;background:${background};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;font-family:'Space Grotesk',Arial,sans-serif;font-size:16px;font-weight:700;color:${color};text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export const emailParagraph = (html: string) =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${html}</p>`;

export const emailHeading = (text: string) =>
  `<h2 style="margin:28px 0 8px;font-family:'Space Grotesk',Arial,sans-serif;font-size:20px;color:${COLORS.deepBlue};">${escapeHtml(text)}</h2>`;

/** Plain-text footer shared by every email. */
export function textFooter() {
  return [
    "Follow along:",
    ...EVENT.socials.map((social) => `- ${social.label}: ${social.href}`),
    "",
    `Questions? Reply to this email or write to ${EVENT.email}.`,
    "",
    `The ${EVENT.name} team`,
    siteUrl(),
  ].join("\n");
}

type Layout = {
  subject: string;
  /** Inbox preview text. */
  preheader: string;
  eyebrow: string;
  /** Already-escaped HTML. */
  heading: string;
  subheading?: string;
  /** Already-escaped HTML for the main panel. */
  body: string;
  /** Why the recipient is getting this email. */
  reason: string;
};

export function emailLayout({
  subject,
  preheader,
  eyebrow,
  heading,
  subheading,
  body,
  reason,
}: Layout) {
  const site = siteUrl();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.grey};font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:${COLORS.ink};">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.grey};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:${COLORS.deepBlue};padding:36px 32px;">
              <p style="margin:0;font-family:'Space Grotesk',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.lime};">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:12px 0 0;font-family:'Space Grotesk',Arial,sans-serif;font-size:32px;line-height:1.1;letter-spacing:-0.02em;color:#ffffff;">${heading}</h1>
              ${subheading ? `<p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#d9def0;">${escapeHtml(subheading)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:${COLORS.ink};color:#c9ccd6;font-size:14px;line-height:1.6;">
              <p style="margin:0;">Follow along: ${EVENT.socials
                .map(
                  (social) =>
                    `<a href="${escapeHtml(social.href)}" style="color:${COLORS.lime};">${escapeHtml(social.label)}</a>`,
                )
                .join(" · ")}</p>
              <p style="margin:8px 0 0;">Questions? Reply to this email or write to <a href="mailto:${EVENT.email}" style="color:${COLORS.lime};">${EVENT.email}</a>.</p>
              <p style="margin:8px 0 0;">${escapeHtml(reason)} <a href="${escapeHtml(site)}" style="color:#ffffff;">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

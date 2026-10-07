// Transactional email. Server only.
//
// RESEND_API_KEY set  → sends through the Resend API (production).
// otherwise SMTP_HOST → sends over SMTP (local dev: Mailpit at http://localhost:54324).
import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

export type EmailAttachment = { filename: string; content: string; contentType: string };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  /** Overrides EMAIL_REPLY_TO for this message. */
  replyTo?: string;
  /** Resend de-duplicates sends with the same key for 24 hours. */
  idempotencyKey?: string;
};

export type EmailResult = { id: string };

const env = (key: string) => process.env[key]?.trim() || undefined;

function sender() {
  const from = env("EMAIL_FROM");
  if (!from) throw new Error("EMAIL_FROM is not set");
  return { from, replyTo: env("EMAIL_REPLY_TO") };
}

let resend: Resend | undefined;
let smtp: Transporter | undefined;

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const { from, replyTo: defaultReplyTo } = sender();
  const replyTo = message.replyTo ?? defaultReplyTo;
  const apiKey = env("RESEND_API_KEY");

  if (apiKey) {
    resend ??= new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(replyTo ? { replyTo } : {}),
        ...(message.attachments
          ? {
              attachments: message.attachments.map((file) => ({
                filename: file.filename,
                content: Buffer.from(file.content).toString("base64"),
                contentType: file.contentType,
              })),
            }
          : {}),
      },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
    );
    if (error || !data)
      throw new Error(`Resend: ${error?.name ?? "unknown"}: ${error?.message ?? "no response"}`);
    return { id: data.id };
  }

  const host = env("SMTP_HOST");
  if (!host)
    throw new Error("Email is not configured: set RESEND_API_KEY (or SMTP_HOST for local dev)");
  const user = env("SMTP_USER");
  smtp ??= nodemailer.createTransport({
    host,
    port: Number(env("SMTP_PORT") ?? 1025),
    secure: env("SMTP_PORT") === "465",
    ...(user ? { auth: { user, pass: env("SMTP_PASS") ?? "" } } : {}),
  });
  const info = await smtp.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    ...(replyTo ? { replyTo } : {}),
    ...(message.attachments ? { attachments: message.attachments } : {}),
  });
  return { id: info.messageId };
}

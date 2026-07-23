import "server-only";
import { env } from "@/core/env";
import { logger } from "@/lib/logger";

/**
 * Transactional e-mail with a provider seam. Three modes, chosen at runtime:
 *
 *  1. SMTP  — when SMTP_HOST + SMTP_USER + SMTP_PASSWORD are set (client's
 *     choice, 2026-07-21: Gmail/OVH-style). Takes precedence.
 *  2. Resend — when RESEND_API_KEY is set and SMTP is not.
 *  3. Simulation — neither configured: the message is logged, not sent, so the
 *     whole funnel runs in dev with no account.
 *
 * The day the SMTP credentials land it goes live with no code change. Callers
 * read `isEmailLive` to know which mode they are in — never claim « un e-mail
 * vous a été envoyé » when it was only logged.
 */

export type EmailAttachment = { filename: string; content: Buffer };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  /** Overrides the default from-address for this message. */
  from?: string;
  /**
   * Where a reply should go. Load-bearing on the operator e-mail: it is sent
   * from Nino's address TO Nino's address, so without this « Répondre » answers
   * himself — and replying with the devis is how the customer receives the
   * thing they paid for.
   */
  replyTo?: string;
};

const isSmtpLive = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
const isResendLive = Boolean(env.RESEND_API_KEY);
export const isEmailLive = isSmtpLive || isResendLive;

/** Where paid dossiers land. Falls back to a demo inbox in simulation so the
 *  funnel is walkable before OPERATOR_EMAIL is configured. */
export const operatorAddress = env.OPERATOR_EMAIL ?? "operateur@olala.demo";

// Over SMTP the sender must be an address the account may send as, so it
// defaults to SMTP_USER; Resend allows its onboarding sandbox address.
const DEFAULT_FROM =
  env.EMAIL_FROM ?? (isSmtpLive ? env.SMTP_USER! : "Ôlala <onboarding@resend.dev>");

export async function sendEmail(message: EmailMessage): Promise<{ delivered: boolean }> {
  const from = message.from ?? DEFAULT_FROM;

  if (isSmtpLive) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // 465 uses implicit TLS; 587/25 upgrade via STARTTLS.
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
    await transport.sendMail({
      from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    return { delivered: true };
  }

  if (isResendLive) {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    if (error) throw new Error(`Resend refused the message: ${error.message}`);
    return { delivered: true };
  }

  logger.info(
    `[email:simulation] → ${message.to}\n  from: ${from}\n  subject: ${message.subject}` +
      `\n  attachments: ${message.attachments?.length ?? 0}` +
      (message.attachments?.length
        ? `\n  files: ${message.attachments.map((a) => a.filename).join(", ")}`
        : ""),
  );
  return { delivered: false };
}

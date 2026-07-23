import "server-only";
import { env } from "@/core/env";
import { dossierStore } from "@/lib/dossiers";
import { operatorAddress, sendEmail } from "@/lib/email";
import { buildCustomerEmail, buildOperatorEmail, type PhotoSummary } from "./emails";

/**
 * Stripe webhook — the ONLY authority on « this dossier is paid » in production.
 *
 * Stripe calls us server-to-server, so payment is recorded and the e-mails go
 * out even if the visitor closed the tab the instant after paying. Everything
 * needed is already server-side by then (the dossier and its photos are stored
 * at checkout), so nothing depends on the browser.
 *
 * Fails closed: no secret ⇒ nothing is accepted; a bad signature ⇒ 400 and no
 * state change. `markPaid` transitions once, which makes a retried Stripe
 * delivery — and the confirmation page racing us — harmless.
 */

export type WebhookResult = { status: number; message: string };

type CheckoutSession = {
  id: string;
  payment_status?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: { reference?: string } | null;
};

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<WebhookResult> {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const key = env.STRIPE_SECRET_KEY;
  // Unconfigured ⇒ refuse everything rather than trust an unsigned POST.
  if (!secret || !key) return { status: 503, message: "Webhook not configured." };
  if (!signature) return { status: 400, message: "Missing signature." };

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return { status: 400, message: "Invalid signature." };
  }

  // 200 for events we don't act on, so Stripe stops retrying them.
  if (event.type !== "checkout.session.completed") {
    return { status: 200, message: "Ignored." };
  }

  const session = event.data.object as CheckoutSession;
  if (session.payment_status !== "paid") return { status: 200, message: "Not paid." };

  const reference = session.metadata?.reference ?? "";
  if (!reference) return { status: 200, message: "No reference." };

  const claimed = await dossierStore.markPaid({ reference }, new Date().toISOString());
  // Already paid (retry, or the confirmation page got there first) ⇒ no re-send.
  if (!claimed) return { status: 200, message: "Already processed." };

  const summaries: PhotoSummary[] = claimed.photos.map((p) => ({
    name: p.name,
    takenAt: p.takenAt,
  }));
  const customer = claimed.email || session.customer_email || session.customer_details?.email || "";

  // Operator first — that's the one the business can't afford to lose.
  // No attachments: the photos stay in the private bucket and Nino views them
  // from the back-office button in the e-mail, so the only copies are the ones
  // the retention job can actually delete. replyTo is the customer — this mail
  // is from Nino to Nino, so without it « Répondre » answers himself.
  await sendEmail({
    to: operatorAddress,
    replyTo: customer || undefined,
    ...buildOperatorEmail(claimed.data, reference, summaries),
  });

  if (customer) {
    await sendEmail({ to: customer, ...buildCustomerEmail(claimed.data, reference) });
  }

  return { status: 200, message: "OK" };
}

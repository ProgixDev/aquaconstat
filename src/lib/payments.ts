import "server-only";
import { clientEnv } from "@/core/env.client";
import { env } from "@/core/env";

/**
 * Checkout with a provider seam, mirroring email.ts.
 *
 * With `STRIPE_SECRET_KEY` set, « Payer » opens a real Stripe Checkout page and
 * payment is confirmed by re-reading the session server-side. Without it, a
 * local demo checkout stands in and « payment » is simulated — so the funnel is
 * walkable end-to-end in dev with no Stripe account. Add the key and it is live.
 *
 * No database: the reference and customer e-mail travel through Stripe's
 * session metadata (real) or the encoded session id (demo), so `getCheckout`
 * can hand them back on the confirmation page without any stored state.
 */

/** Price of « Étude du dossier & devis détaillé », in cents. Matches the CGV. */
const AMOUNT_CENTS = 8290;
const PRODUCT_NAME = "Étude du dossier & devis détaillé";
const DEMO_PREFIX = "demo_";

export const isPaymentLive = Boolean(env.STRIPE_SECRET_KEY);

export type CheckoutInput = { reference: string; customerEmail: string };
export type CheckoutResult = { paid: boolean; reference: string; email: string };

/** Creates a checkout and returns the URL to send the visitor to. */
export async function createCheckout(input: CheckoutInput): Promise<{ url: string }> {
  const site = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  if (!isPaymentLive) {
    const token = Buffer.from(JSON.stringify(input)).toString("base64url");
    return { url: `/dossier/paiement/demo?s=${token}` };
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: AMOUNT_CENTS,
          product_data: { name: PRODUCT_NAME },
        },
      },
    ],
    customer_email: input.customerEmail || undefined,
    metadata: { reference: input.reference },
    success_url: `${site}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/dossier/paiement?canceled=1`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url };
}

/**
 * Reads a checkout back: whether it is paid, plus the reference and e-mail it
 * carries. Returns paid:false for anything it can't verify — the send path
 * must never fire on an unconfirmed payment.
 */
export async function getCheckout(sessionId: string): Promise<CheckoutResult> {
  const unpaid: CheckoutResult = { paid: false, reference: "", email: "" };

  // Simulation only: a demo token stands in for a paid session. This branch is
  // unreachable once Stripe is live, so a forged `demo_` id can never be
  // trusted in production — there it falls through to a real Stripe lookup.
  if (!isPaymentLive) {
    if (!sessionId.startsWith(DEMO_PREFIX)) return unpaid;
    try {
      const json = Buffer.from(sessionId.slice(DEMO_PREFIX.length), "base64url").toString();
      const parsed = JSON.parse(json) as CheckoutInput;
      return { paid: true, reference: parsed.reference, email: parsed.customerEmail };
    } catch {
      return unpaid;
    }
  }

  // Live: only Stripe's own answer counts; an unknown/invalid id is unpaid,
  // never a 500.
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === "paid",
      reference: session.metadata?.reference ?? "",
      email: session.customer_email ?? session.customer_details?.email ?? "",
    };
  } catch {
    return unpaid;
  }
}

/** Encodes the demo « session id » the confirmation page receives on success. */
export function demoSessionId(input: CheckoutInput): string {
  return DEMO_PREFIX + Buffer.from(JSON.stringify(input)).toString("base64url");
}

export { AMOUNT_CENTS, PRODUCT_NAME };

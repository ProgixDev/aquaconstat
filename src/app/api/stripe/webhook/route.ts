import { handleStripeWebhook } from "@/features/funnel";

/**
 * Stripe's payment callback. A genuine HTTP webhook, so a route handler is the
 * right shape here (not a server action). The body must be read RAW — Stripe
 * signs the exact bytes, so any parsing would break verification.
 *
 * All logic lives in the funnel slice; this file only adapts HTTP to it.
 */

// Never prerender or cache: every call is a unique signed event.
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const { status, message } = await handleStripeWebhook(rawBody, signature);
  return new Response(message, { status });
}

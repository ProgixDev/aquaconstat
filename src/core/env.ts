import "server-only";
import { z } from "zod";

/**
 * Server-side environment access — the ONLY place process.env is read.
 * `server-only` makes importing this from a client component a build error,
 * which is exactly the failure mode we want (secrets can't drift client-side).
 * Client-exposed values must be NEXT_PUBLIC_* and added to the separate schema below.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Server-only secrets. NEVER prefix these NEXT_PUBLIC_ — they must not reach the
  // browser. The Supabase service_role key bypasses RLS; use it only in trusted
  // server code (e.g. the account-deletion route). Optional until you wire it up.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  // Admin back-office gate (ADR-0008). Both are `.optional()` on purpose:
  // this schema is parsed at module load and `pnpm verify` runs `pnpm build`,
  // so making them required would break the build for anyone without secrets
  // (agents are hook-blocked from writing .env.local at all).
  //
  // Optional does NOT mean lenient. Unset ⇒ every login is denied and every
  // requireAdminSession() redirects — /admin is simply shut. There is no
  // "allow when unconfigured" branch anywhere; missing config fails closed.
  ADMIN_PASSWORD: z.string().min(12).optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),

  // Funnel checkout + transactional e-mail (spec 006, email-first variant).
  // All optional: when a key is absent the corresponding provider runs in
  // SIMULATION mode (a local demo checkout / e-mails logged to the server),
  // so the whole flow works in dev with no accounts. Paste the real keys and
  // it goes live with no code change — the providers detect them at runtime.
  STRIPE_SECRET_KEY: z.string().min(20).optional(),
  // Verifies the Stripe webhook signature (spec 006). Without it the webhook
  // route rejects every call — payment confirmation then only happens via the
  // demo/simulation path, never a forgeable unsigned POST.
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),
  RESEND_API_KEY: z.string().min(10).optional(),
  // SMTP transport (client's choice, 2026-07-21 — Gmail/OVH-style rather than
  // Resend). When SMTP_HOST + SMTP_USER + SMTP_PASSWORD are all set, e-mail
  // goes out over SMTP; it takes precedence over Resend. Port derives `secure`
  // (465 ⇒ implicit TLS, otherwise STARTTLS) unless you know you need otherwise.
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(587),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  // Where paid dossiers are e-mailed (Nino's inbox). Falls back to a demo
  // address in simulation.
  OPERATOR_EMAIL: z.string().email().optional(),
  // From-address for transactional e-mail. Over SMTP this should be an address
  // your provider lets SMTP_USER send as (often SMTP_USER itself).
  EMAIL_FROM: z.string().min(3).optional(),
});

export const env = serverEnvSchema.parse(process.env);

# Backend (Supabase — server-owned data store)

Supabase is used here as a **private data store** for dossiers plus a **private photo bucket**,
reached exclusively through the **service-role** client from server code (ADR-0007). There is **no
end-user Supabase auth**: the devis funnel is anonymous, and the admin area is gated by a shared
password (ADR-0008). Golden rule: **the service-role key is the authorization boundary and never
leaves the server** — the browser never talks to Supabase.

> The skeleton's SSR cookie-auth setup (browser/server/middleware clients, `src/features/auth/`,
> per-user `auth.users` tables) was removed — this app has no logged-in end users. RLS stays on as
> defence in depth: the tables deny all by default and only the service-role client (which bypasses
> RLS) can reach them.

## Client (`src/lib/supabase/`)

- **`admin.ts`** — the only client. Service-role (`createClient` with `SUPABASE_SERVICE_ROLE_KEY`),
  `server-only`, **bypasses RLS**, no session persistence. Everything server-side goes through it:
  the dossier store (`src/lib/dossiers/supabase.ts`) and photo storage (`src/lib/dossiers/photos.ts`).
  Never expose this client or the key to the browser.

Simulation fallback: when `SUPABASE_SERVICE_ROLE_KEY` is unset, the store and photo layers fall back
to an in-memory implementation (`src/lib/dossiers/memory.ts`), so dev and tests run with no cloud.

## The admin area is password-gated, not Supabase auth (ADR-0008)

`/admin/*` is gated by a **shared password** (`ADMIN_PASSWORD`) with an HMAC-signed `httpOnly`
cookie — there is one operator and no user table. Three things about it generalise to any gate in
this repo:

- **The boundary is the data layer, not the layout.** `getDossiers()`/`getDossier()` in
  `src/features/admin/data.ts` call `requireAdminSession()` themselves. A layout is not a reliable
  gate: Next skips rendering a layout segment when the client's `Next-Router-State-Tree` header
  claims it is already mounted, and that header is shape-validated but never authenticated —
  `generateMetadata` runs outside the layout too. Middleware and the layout are convenience.
- **Middleware only checks that the cookie exists.** It runs on Edge and cannot import
  `@/core/env` (`server-only`), so it cannot verify a signature. It redirects; it does not
  authorize.
- **Data modules holding PII carry `import "server-only"`.** Without it, a value import from a
  `"use client"` component ships records into a public `/_next/static` chunk — which the
  middleware matcher excludes, so no gate can reach it. This is not hypothetical; it is what
  `data.ts` did until 2026-07-16.

## Database — secure-by-default

Migrations in `supabase/migrations/` run in order:

- **`0001_security_baseline`** — deny-by-default: blanket grants revoked, RLS auto-enabled on every
  new public table, a `private` schema for `security definer` helpers (`search_path = ''` pinned).
- **`0005_dossiers`** — the `dossiers` table: `reference` (unique), contact fields, `statut`,
  `paid_at`, `devis_envoye_at`, `stripe_session_id`, the full answers as `data jsonb`, and photo
  metadata as `photos jsonb`. **RLS enabled with no policies ⇒ deny-all**; only the service-role
  client reaches it.
- **`0006_dossier_photos`** — the private `dossier-photos` **storage bucket** (images only,
  size-limited), created non-public so no object is ever served without a signed URL.

Because there are no per-user tables (single operator, anonymous funnel), there is no
`auth.uid()`/policy model to maintain — the data is server-owned and the service-role key is the
boundary. If a future feature ever needs per-user rows, add an ADR and a proper one-policy-per-command
RLS model before creating the table.

## Photos (private bucket)

Photos are uploaded to the private `dossier-photos` bucket **at checkout** (nothing depends on the
browser surviving the Stripe redirect). The admin only ever sees **short-lived signed URLs**; the
bytes are never public. Retention is automated — 12 months after payment, 7 days if never paid —
and must run through the Storage API, not SQL (Supabase forbids direct `storage.objects` deletes).
See `src/lib/dossiers/photos.ts` and `src/lib/dossiers/retention.ts`.

## Payments (paid state is server-owned)

A Stripe **webhook Route Handler** (`src/app/api/stripe/webhook`) verifies the `Stripe-Signature`
against the raw body, then marks the dossier paid with the service-role client — a compare-and-set
`markPaid` that transitions once, so a retried delivery can't double-send. The browser never sets
paid state. See `src/features/funnel/webhook.ts`.

## Verification

- `supabase test db` runs the pgTAP RLS tests in `supabase/tests/database/rls.test.sql`.
- `supabase db lint` (Security Advisor) must be clean of ERROR lints — notably **0013** (RLS
  disabled in public) and **0015** (RLS references `user_metadata`).

## Setup (on your machine)

```
pnpm add @supabase/supabase-js
# set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (+ SUPABASE_SERVICE_ROLE_KEY) in .env.local
supabase start && supabase db reset && supabase test db
```

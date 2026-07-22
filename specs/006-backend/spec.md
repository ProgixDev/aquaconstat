# Spec 006 — Backend (persistence, paiement, suivi de statut, admin réel)

- **Status:** draft
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
- **Date:** 2026-07-17 (R2R 2026-07-21)
- **Slice / areas touched:** `src/features/funnel/` (submit + paiement), `src/features/admin/`
  (données réelles + actions), `supabase/migrations/`, `src/core/env*.ts`, `src/lib/supabase/`,
  routes `/dossier/paiement`, `/confirmation`, `/admin/dossiers*`, a Stripe webhook route handler,
  and **removal** of the unused skeleton auth scaffolding (`/sign-in`, `/account`,
  `src/features/auth/`, `profiles` + `notes` migrations/routes).

## R2R — 2026-07-21: e-mail-first shipped in simulation; photos e-mailed not stored; devis is a status flip (Houssem)

Since this spec was drafted (2026-07-17) the **e-mail-first architecture was built and shipped in
simulation** (commit `0ab1b61`): the funnel takes payment through a Stripe/demo checkout seam, the
confirmation page re-verifies payment server-side, and the operator dossier + customer confirmation
go out by e-mail (SMTP — Gmail/OVH — with Resend and a logging fallback). What is still missing —
and what this spec now narrows to — is **durable persistence + a real admin**: today nothing is
stored, so the admin still reads the mock fixture and a paid dossier lives only in Nino's inbox.

Three decisions correct the ACs below (edited in place; reasoning kept here):

1. **Photos ARE stored — in a private Supabase bucket (client, 2026-07-22, on the Pro plan).**
   A brief 2026-07-21 call to e-mail photos only (no storage) was **reversed the next day**: since
   the photos ARE the deliverable the artisan quotes from, losing them on a closed tab is
   unacceptable, and storage cost is negligible on Pro. So photos are uploaded to a **private**
   bucket at checkout (before the Stripe redirect), served to the admin via short-lived signed URLs,
   and still attached to the operator e-mail. This keeps the spec's **original AC-2** (private
   bucket). The RGPD concern becomes a **retention policy**, not a reason to avoid storage: private
   bucket, admin-only signed access, and auto-deletion after a retention window (`pg_cron`),
   documented in the confidentialité page. Because photos are server-side, the webhook path is now
   fully reliable — nothing is lost on a closed tab.
2. **« Devis envoyé » is a status flip, not a system send.** The pro prepares the devis and sends
   it to the client himself by replying to the operator e-mail; from the admin he only marks the
   dossier « Devis envoyé ». The system never generates, uploads, or e-mails a PDF. This
   **replaces the original AC-6**.
3. **Statuses are « En attente » / « Devis envoyé »** (client, 2026-07-21 — the intermediate
   « En cours » is gone), and e-mail transport is **SMTP-first** (Gmail/OVH), not Resend.

## Problem (the why)

The front-end is complete but every visitor-facing transaction is a painted door: paying charges
nothing ([paiement-form.tsx:98](../../src/features/funnel/components/paiement-form.tsx#L98)),
the funnel is an in-memory store that a refresh wipes (no `submitDossier` action, no table),
photos never leave the browser ([photos-form.tsx:37](../../src/features/funnel/components/photos-form.tsx#L37)),
no email is ever sent, and the admin reads a hardcoded 9-row fixture
([admin/data.ts](../../src/features/admin/data.ts)) whose status switcher forgets on reload. So
today the business cannot take money, receive a request, or deliver a devis. The security spine
is already real (deny-by-default RLS baseline, server-only secrets, HMAC admin sessions) — this
spec builds the product backend on top of it, and is designed end-to-end now so the architecture
is ready while the remaining frontend polish continues.

## Desired behavior (the what)

A visitor fills the funnel and pays; their dossier and photos are saved durably and the operator
(Nino) works real dossiers from the admin. The build is designed as one architecture, delivered
in three phases:

**Phase 1 — Capture the request + take the money.**
On étape 4 the visitor accepts the two consents and clicks « Payer 82,90 € ». The dossier's text
fields (coordonnées, lieu, statut, questionnaire) **and its photos** are persisted first — photos
uploaded to a **private** bucket keyed to the dossier — then the visitor is sent to Stripe's hosted
payment page. On success Stripe redirects them to `/confirmation`, which shows the server-generated
reference (AC-2026-NNNN) and their e-mail. The dossier is only marked paid when Stripe confirms it
server-side (webhook) — never from the browser redirect alone; the same webhook sends the operator
e-mail (with the photos attached) and the customer confirmation, so a closed tab can no longer lose
either the send or the photos. A failed or abandoned payment leaves the dossier saved but unpaid,
and the visitor can retry without re-entering anything; photos of never-paid dossiers are swept by
the retention job.

**Phase 2 — Confirm by e-mail, mark the devis sent.**
Once payment is confirmed the client automatically receives a confirmation e-mail. The devis is
**prepared and sent by the professional himself**, by replying to the operator e-mail — the system
neither generates, uploads, nor sends a PDF. In the admin dossier view Nino simply marks the
dossier « Devis envoyé » once he has replied; the status persists.

**Phase 3 — Admin on real data.**
The admin list and dossier detail show real submitted dossiers (not the fixture), with real SLA
countdowns from the actual `paidAt`. Changing a dossier's statut persists and survives reload.

Throughout: the reference number is generated server-side and is unique; nothing that identifies
a dossier or its photos is ever exposed to an unauthenticated request.

## Acceptance criteria

Phased; each is independently testable. « Persisted » means survives a server restart and is
visible to a fresh request.

- **AC-1 (P1 · persistence):** Submitting the funnel writes one dossier row with all entered
  fields and a unique server-generated `AC-2026-NNNN` reference; a second submit never collides.
- **AC-2 (P1 · photos in a private bucket) — restored 2026-07-22:** The visitor's photos are
  uploaded at checkout to a **private** bucket keyed to the dossier. They are readable by the admin
  only via short-lived signed URLs and are **not** reachable by an anonymous/public URL. Files over
  the size limit are rejected server-side (not only in the UI). Photos of dossiers never paid are
  removed by the retention job.
- **AC-3 (P1 · payment happy path):** « Payer 82,90 € » redirects to Stripe Checkout for exactly
  82,90 € TTC; on success the visitor lands on `/confirmation` with the correct reference and
  e-mail, and the dossier's `paidAt` is set **only** after the signature-verified webhook fires.
- **AC-4 (P1 · payment non-happy path):** A cancelled/failed payment returns the visitor to the
  funnel with the dossier saved but unpaid and no `paidAt`; retrying pays the same dossier without
  re-entering data and never creates a duplicate paid charge. A webhook with a bad signature is
  rejected and changes nothing.
- **AC-5 (P2 · confirmation email):** On confirmed payment the client receives a confirmation
  e-mail at the address they entered; the confirmation page no longer claims an e-mail was sent
  unless one actually was.
- **AC-6 (P2 · devis marked sent) — rewritten 2026-07-21:** From a **paid** dossier the admin can
  set the status to « Devis envoyé »; the change persists and is still set after a reload, with a
  timestamp. The pro sends the actual devis to the client by replying to the operator e-mail — the
  system neither generates, uploads, nor e-mails a PDF. Marking « Devis envoyé » is impossible on
  an unpaid dossier.
- **AC-7 (P3 · admin real data):** `/admin/dossiers` lists the real submitted dossiers (not the
  fixture) with SLA state derived from real `paidAt`; opening one shows that dossier's own text data
  and its photos (via signed URLs), including the lightbox.
- **AC-8 (P3 · status persists):** Changing a dossier's statut in the admin persists and is still
  set after a reload.
- **AC-9 (authorization):** Every dossier read/write, status change, and photo access requires the
  admin session; an unauthenticated request to any dossier data, photo, or admin action is denied
  (verified at the data/storage layer, not only by a redirect). Photo URLs are signed and
  short-lived; the bucket is private. The Stripe webhook is authenticated by signature, not by the
  admin session.
- **AC-10 (cleanup):** The unused visitor-auth scaffolding (`/sign-in`, `/account`, the `auth`
  slice, `profiles`/`notes`) is removed; `pnpm verify` and all CUJ e2e stay green, and no
  remaining route or import references the deleted code.

## Out of scope

- **Public photo access / photo CDN** — photos live in a **private** bucket; the admin reaches them
  only through short-lived signed URLs. No public bucket, no un-signed URL, ever.
- **System-generated / uploaded / e-mailed devis** — the pro prepares the devis and sends it to the
  client himself by replying to the operator e-mail; the system only records « Devis envoyé ». No
  PDF generation, upload, or delivery by the platform.
- **Per-user / multi-operator admin accounts** — the existing single shared-password admin auth
  stays (ADR-0008 path); no Supabase Auth for the operator in this spec.
- **Visitor accounts** — the funnel remains account-less (« sans création de compte »).
- **Refunds / partial payments / invoicing beyond Stripe's receipt**, dunning, retries by the
  system, multi-currency.
- **Real-time admin updates**, notifications/SMS, and the `chat-realtime` pack.
- **SLA correctness edge cases** (Europe/Paris vs UTC, French public holidays) — tracked in
  spec 004, not reopened here.
- Buying the domain / flipping SEO public (`NEXT_PUBLIC_SITE_URL`) — an ops step, not code.

## CUJ impact

- **Extends CUJ-02 (Submit a dossier):** the funnel now persists and takes a real payment; the
  confirmation reference is server-owned. E2e must cover the real (test-mode) Stripe path or a
  documented seam, plus the saved-but-unpaid retry.
- **Extends CUJ-03 (Admin reviews a dossier):** admin now reads real dossiers and persists statut
  (« En attente » → « Devis envoyé »).
- No new CUJ registered; update `docs/product/critical-user-journeys.md` at ship.

## Open questions

Resolved before `/plan-feature` proceeds.

- [ ] **Stripe account & keys** — is there a Stripe account for Ôlala (test + live), and is the
      82,90 € TTC inclusive of any VAT line Stripe should show? (Needed for AC-3.) Still pending the
      client's Stripe onboarding.
- [ ] **Webhook secret & endpoint** — the webhook needs `STRIPE_WEBHOOK_SECRET` and a publicly
      reachable `/api/stripe/webhook` (so it also needs the deployed `NEXT_PUBLIC_SITE_URL`). In
      simulation (no keys) the demo checkout must still mark the dossier paid without a webhook.
- [x] **E-mail sender identity — resolved 2026-07-21:** transport is **SMTP** (Gmail/OVH), not
      Resend. From-address = `EMAIL_FROM` on a domain mailbox; SPF/DKIM/DMARC on that domain is the
      deliverability step (ops, not code).
- [ ] **Photo retention window — needs a number (2026-07-22).** Photos now persist in a private
      bucket (Pro plan). Pick the auto-deletion window: the `pg_cron` job deletes photos (and sweeps
      never-paid dossiers) after N days/months, and a delete-on-request removes a dossier's row +
      its bucket objects. Default proposal: **12 months** for paid dossiers, **7 days** for
      never-paid. Confirm the numbers and add the line to the confidentialité page.
- [ ] **Reference format ownership** — keep `AC-2026-NNNN` exactly (now server-generated), or move
      to a different scheme before real dossiers exist?

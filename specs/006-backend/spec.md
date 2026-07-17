# Spec 006 — Backend (persistence, paiement, livraison du devis, admin réel)

- **Status:** draft
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
- **Date:** 2026-07-17
- **Slice / areas touched:** `src/features/funnel/` (submit + paiement), `src/features/admin/`
  (données réelles + actions), new `src/features/devis/` if needed, `supabase/migrations/`,
  `src/core/env*.ts`, `src/lib/supabase/`, routes `/dossier/paiement`, `/confirmation`,
  `/admin/dossiers*`, a Stripe webhook route handler, and **removal** of the unused skeleton
  auth scaffolding (`/sign-in`, `/account`, `src/features/auth/`, `profiles` + `notes`
  migrations/routes).

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
On étape 4 the visitor accepts the two consents and clicks « Payer 82,90 € ». The dossier
(coordonnées, lieu, statut, questionnaire, and the photos they uploaded) is persisted first, its
photos stored in private storage, then the visitor is sent to Stripe's hosted payment page. On
success Stripe redirects them to `/confirmation`, which shows the server-generated reference
(AC-2026-NNNN) and their e-mail. The dossier is only marked paid when Stripe confirms it
server-side (webhook) — never from the browser redirect alone. A failed or abandoned payment
leaves the dossier saved but unpaid, and the visitor can retry without re-entering anything.

**Phase 2 — Confirm by e-mail, deliver the devis.**
Once payment is confirmed, the client automatically receives a confirmation e-mail. The devis
itself is **prepared manually by the professional** (SAS BATITEC) — the system does not generate
it. In the admin dossier view Nino uploads the finished devis PDF and clicks « Envoyer le
devis »; the system e-mails it to the client and records that it was sent.

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
- **AC-2 (P1 · storage):** The visitor's uploaded photos are stored in a **private** bucket keyed
  to the dossier; they are readable by the admin (via signed/authorized access) and **not**
  reachable by an anonymous URL. Files over the size limit are rejected server-side, not only in
  the UI.
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
- **AC-6 (P2 · devis delivery):** From a paid dossier, the admin can upload a devis PDF and send
  it; the client receives it by e-mail and the dossier records « devis envoyé » with a timestamp.
  Sending is impossible on an unpaid dossier.
- **AC-7 (P3 · admin real data):** `/admin/dossiers` lists the real submitted dossiers (not the
  fixture) with SLA state derived from real `paidAt`; opening one shows that dossier's own data
  and photos.
- **AC-8 (P3 · status persists):** Changing a dossier's statut in the admin persists and is still
  set after a reload.
- **AC-9 (authorization):** Every dossier read/write and every photo access requires the admin
  session; an unauthenticated request to any dossier data, photo, or admin action is denied
  (verified at the data/storage layer, not only by a redirect).
- **AC-10 (cleanup):** The unused visitor-auth scaffolding (`/sign-in`, `/account`, the `auth`
  slice, `profiles`/`notes`) is removed; `pnpm verify` and all CUJ e2e stay green, and no
  remaining route or import references the deleted code.

## Out of scope

- **Auto-generating the devis PDF** — the pro prepares it manually (decided 2026-07-17); the
  system only stores and sends it.
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
- **Extends CUJ-03 (Admin reviews a dossier):** admin now reads real dossiers, persists statut,
  and can send a devis.
- No new CUJ registered; update `docs/product/critical-user-journeys.md` at ship.

## Open questions

Resolved before `/plan-feature` proceeds.

- [ ] **Stripe account & keys** — is there a Stripe account for Ôlala (test + live), and is the
      82,90 € TTC inclusive of any VAT line Stripe should show? (Needed for AC-3.)
- [ ] **E-mail sender identity** — from-address/domain for transactional e-mail (Resend) and DNS
      access to verify it. `contact@olala.fr` is the reply target today; confirm it can send.
- [ ] **Data retention** — the CGV/RGPD state 3-year retention; confirm dossiers + photos follow
      it and whether an anonymised delete is needed on request (affects schema/storage lifecycle).
- [ ] **Reference format ownership** — keep `AC-2026-NNNN` exactly (now server-generated), or move
      to a different scheme before real dossiers exist?

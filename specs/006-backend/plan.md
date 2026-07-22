# Plan 006 — Backend (persistence, paiement, suivi de statut, admin réel)

- **Spec:** [spec.md](spec.md) (all open questions resolved: yes — see _Decisions_; Stripe keys/webhook secret are runtime prerequisites, handled by the seam, not blockers)
- **Author:** Claude (agent) · **Date:** 2026-07-22

## Approach

Add a single **server-only dossier store** (`src/lib/dossiers/`) behind the same seam as e-mail
and payments: a **Supabase adapter** (service-role client, RLS deny-all) when
`SUPABASE_SERVICE_ROLE_KEY` is set, and an **in-memory adapter** (module-level Map, seeded with
today's fixture) otherwise — so dev/e2e run with no cloud and the admin always has content. At
checkout the funnel persists the dossier's **text** and **uploads its photos to a private bucket**
(keyed by reference); payment truth comes from a **Stripe webhook** (`checkout.session.completed`)
that marks the row paid and sends the operator e-mail (photos attached, fetched from the bucket) +
the customer confirmation — fully reliable even if the tab closes, because everything is already
server-side. Admin readers switch from the fixture to the store and show photos via short-lived
**signed URLs** (lightbox kept); the dossier status toggle becomes a real, admin-gated server
action.

Because photos are stored (client, 2026-07-22, Pro plan), there is **no tab-close gap** — the
earlier e-mail-only tradeoff is gone. The one obligation it adds is a **retention policy**: paid
dossiers are purged after **12 months**, never-paid after **7 days**, plus a delete-on-request
helper. That sweep runs in **server code behind `POST /api/retention`** (a `CRON_SECRET` bearer),
**not** a pg_cron SQL job — Supabase refuses direct deletes from `storage.objects` ("Use the Storage
API instead"), so photos can only be removed through the API. The bucket is private; the admin
reaches photos only through signed URLs (the security baseline denies anon/authenticated by default).

## Decisions (resolving spec open questions)

- **Reference format:** keep `AC-2026-NNNN`, now enforced unique by a DB constraint with
  retry-on-conflict.
- **Schema shape:** queryable columns for the admin list + a `data jsonb` snapshot for the detail +
  a `photos jsonb` array (`{path, name, takenAt}`). Bytes live in the private `dossier-photos`
  bucket, reached via signed URLs.
- **Auth:** admin stays HMAC-cookie (not Supabase Auth); all dossier reads/writes go through the
  **service-role** client server-side. RLS is enabled (baseline event trigger) with **no policies**
  → anon/authenticated get nothing. The webhook authenticates by **Stripe signature**, not the
  admin session.
- **Simulation payment:** the demo checkout has no webhook, so `/confirmation`'s `confirmAndSend`
  marks the demo dossier paid (it already verifies the demo token) — same code path, seam-selected.

## Placement (per `docs/architecture/module-boundaries.md`)

| What                 | Where                                                                                 | Notes                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Dossier store (seam) | `src/lib/dossiers/` (`index.ts`, `supabase.ts`, `memory.ts`, `photos.ts`, `types.ts`) | server-only; shared because funnel writes & admin reads (features→lib, never feature→feature) |
| Migrations           | `0005_dossiers.sql`, `0006_dossier_photos.sql` (photos col + private bucket)          | RLS auto-enabled by 0001 baseline; bucket private, no storage policies                        |
| Webhook              | `src/app/api/stripe/webhook/route.ts`                                                 | route handler (genuine HTTP webhook — allowed)                                                |
| Funnel writes        | `src/features/funnel/actions.ts`                                                      | `startCheckout` persists dossier; `confirmAndSend` marks demo paid                            |
| Admin reads/writes   | `src/features/admin/data.ts`, `actions.ts` (new)                                      | store-backed reads; `setDossierStatut` action                                                 |
| Env                  | `src/core/env.ts`                                                                     | add `STRIPE_WEBHOOK_SECRET` (optional)                                                        |

## Data & state

- **Server data:** `dossiers` (id, reference unique, nom, ville, email, created_at, paid_at, statut
  `En attente|Devis envoyé`, devis_envoye_at, stripe_session_id, `data jsonb`). Indexes on
  `reference` (unique), `paid_at`, `statut`.
- **Store API (server-only):** `createDossier(reference, data)`, `markPaid(sessionId|reference, at)`
  (idempotent — only when `paid_at` is null), `listDossiers()`, `getDossier(ref)`,
  `setStatut(ref, statut)`. Adapter chosen by `SUPABASE_SERVICE_ROLE_KEY` presence.
- **Client state:** none new — the admin status toggle calls the action and refreshes.
- **Actions (zod-validated, authz):** `startCheckout(dossier)` persists then returns the Stripe/demo
  URL; `setDossierStatut(ref, statut)` requires `requireAdminSession()` and a **paid** dossier.

## Acceptance criteria → verification mapping

| AC                            | Proven by                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| AC-1 persistence + unique ref | unit `src/lib/dossiers/memory.test.ts` (create writes row; second same-ref collides/retries)           |
| AC-2 photos in private bucket | unit: upload keys objects by reference, bucket is private; admin gets a **signed** URL, anon gets none |
| AC-3 payment happy            | e2e `e2e/funnel.spec.ts` (demo path) → dossier appears **paid** in `/admin/dossiers`                   |
| AC-4 payment non-happy        | e2e cancel returns saved-but-unpaid; unit `webhook.test.ts` bad signature → 400, no `markPaid`         |
| AC-5 confirmation e-mail      | unit `webhook.test.ts` (paid → customer e-mail queued) + existing `emails.test.ts`                     |
| AC-6 devis marked sent        | unit `admin actions.test.ts` (setStatut needs paid + session); e2e flip persists                       |
| AC-7 admin real data          | e2e: funnel submit in simulation → row visible in `/admin/dossiers` with SLA from `paid_at`            |
| AC-8 status persists          | e2e: flip to « Devis envoyé », reload, still set                                                       |
| AC-9 authorization            | unit: `setDossierStatut`/`listDossiers` without session denied; webhook by signature only              |
| AC-10 cleanup (auth scaffold) | **split to its own task/PR** (T12) — `pnpm verify` + e2e green, no dangling imports                    |

## Risks & unknowns

- **Retention policy** is now an obligation (photos are stored): the `pg_cron` job + a
  confidentialité line must ship, and the deletion windows need the client's numbers (default
  paid 12 mo / never-paid 7 d). Never-paid dossiers accumulate photos until swept.
- **Photo upload adds checkout latency** — several downscaled images upload before the Stripe
  redirect. Downscale client-side first (already done); upload in parallel; show a "préparation…"
  state on the pay button.
- **Signed-URL exposure** — URLs are short-lived and admin-generated; the bucket is private, so a
  leaked URL expires fast and there is no public listing.
- **Stripe keys / `STRIPE_WEBHOOK_SECRET` / public URL** are runtime prerequisites — the seam keeps
  everything green in simulation; going live is env-only. No e2e against live Stripe (documented
  seam; demo path is the hermetic test).
- **In-memory store is per-process** (simulation only) — fine for dev/e2e, never the prod path;
  documented so no one mistakes it for durability.
- **AC-10 auth-scaffold removal** is orthogonal and risky (touches routes/middleware) — sequenced
  last and splittable.

## Overlap check

Active specs touching the same areas: **004-admin** (owns `src/features/admin/*`) and **003-funnel**
(owns `src/features/funnel/*`). Resolution: this spec **extends** both rather than competing —
admin readers move fixture→store and photos move mock-path→signed-URL, but the **layout and the
photo lightbox are unchanged**, so 004's ACs (incl. AC-3 lightbox) still hold. The funnel gains
persistence + photo upload at the existing checkout seam (003's funnel UI unchanged). No parallel
edits to the same files by another _active_ plan. Sequence after the current funnel work is merged.

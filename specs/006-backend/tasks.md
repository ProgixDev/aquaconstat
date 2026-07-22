# Tasks 006 — Backend (persistence, paiement, suivi de statut, admin réel)

Ordered, executable, checkboxed. `[P]` = parallel-safe. Each task names files + a done-check.
Keep the seam green at every step: nothing here breaks the simulation path.

## Phase 0 — setup

- [x] T0 Add `STRIPE_WEBHOOK_SECRET` (optional) to `src/core/env.ts`. (Branch: staying on `main`
      per the project's established flow.) · done: `pnpm typecheck` green.

## Phase 1 — dossier store seam (AC-1, AC-2, AC-9)

- [x] T1 `src/lib/dossiers/types.ts` — `DossierRecord` + `DossierData` (text only, no photos),
      `DossierStore` interface. · done: types compile.
- [x] T2 `src/lib/dossiers/memory.ts` — in-memory adapter (module-level Map, seeded with the nine
      fixture dossiers), all store methods; idempotent `markPaid`. · done: `memory.test.ts` green (AC-1).
- [x] T3 `src/lib/dossiers/supabase.ts` — service-role adapter (upsert/select/update via
      `createAdminClient`); `markPaid` guarded on `paid_at IS NULL`. · done: typechecks.
- [x] T4 `src/lib/dossiers/index.ts` — seam: pick adapter by `SUPABASE_SERVICE_ROLE_KEY`;
      `isDossierStoreLive`. · done: `memory.test.ts` asserts payload carries **no image data** (AC-2).
- [x] T5 Migration `supabase/migrations/0005_dossiers.sql` — `dossiers` table + indexes; RLS/deny-all
      from the 0001 baseline. Applied via MCP to project `eagccpfxqwrvlscevpbl`; security advisors clean
      (only the expected INFO « RLS enabled, no policy » = intended deny-all). · done: `list_tables`
      shows `dossiers` (rls_enabled: true).
- [x] T5b Migration `0006_dossier_photos.sql` — `photos jsonb` column + **private** `dossier-photos`
      bucket (20 MB, images only). Applied via MCP; advisors still clean. · done: bucket `public:false`
      confirmed.
- [ ] T5c `src/lib/dossiers/photos.ts` — `uploadPhotos(reference, files)`, `signPhotoUrls(paths)`,
      `deletePhotos(reference)`. Live = service-role storage; simulation = no-op (photos stay
      browser-e-mailed, admin shows the seed mocks). Add `photos: DossierPhoto[]` to `DossierRecord`.
      · done: typechecks; memory adapter returns seed photo urls.

## Phase 2 — capture + confirm payment (AC-3, AC-4, AC-5)

- [ ] T6 `startCheckout(dossier + photos)` in `funnel/actions.ts` — zod-parse the dossier,
      `createDossier` (« En attente »), **upload photos to the bucket (live)**, put reference in Stripe
      metadata, return URL. Wire `paiement-form.tsx` to send the downscaled photos. · done: unit —
      invalid dossier rejected; sim returns demo URL; live uploads keyed by reference.
- [ ] T7 `src/app/api/stripe/webhook/route.ts` — verify signature (`STRIPE_WEBHOOK_SECRET`);
      on `checkout.session.completed` → `markPaid` + customer confirmation + **operator e-mail with the
      photos fetched from the bucket**; idempotent. · done: `webhook.test.ts` — good event pays once;
      **bad signature → 400, no markPaid** (AC-4).
- [ ] T8 `confirmAndSend` (demo/sim only) — mark the demo dossier paid (token already verified), keep
      the browser-sent operator e-mail **with photos** (sim has no bucket). · done: existing
      confirmation e2e still green; customer e-mail asserted (AC-5).

## Phase 3 — admin on real data (AC-6, AC-7, AC-8)

- [ ] T9 `admin/data.ts` — `getDossiers`/`getDossier` read the **store** (live→Supabase,
      sim→memory), keep `requireAdminSession()`; map records → `DossierRow`/`DossierDetail`, resolving
      photos to **signed URLs** (live) or seed mocks (sim). **Keep the photo grid + lightbox.**
      · done: admin list renders store rows; SLA from real `paid_at`; detail shows photos (AC-7).
- [ ] T10 `admin/actions.ts` — `setDossierStatut(ref, statut)`: `requireAdminSession()`, refuse on
      unpaid, persist. Wire the detail toggle (replace local `useState`). · done: `actions.test.ts` —
      no session denied, unpaid refused (AC-6, AC-9); e2e flip persists across reload (AC-8).
- [ ] T10b Retention `0007_retention.sql` — `pg_cron` job: delete never-paid dossiers + their bucket
      objects after ~7 d, and paid ones after ~12 mo (confirm windows with client); a
      `deleteDossier(ref)` helper for delete-on-request. Add one line to the confidentialité page.
      · done: cron scheduled; helper removes row + objects.

## Phase 4 — verification

- [ ] T11 E2E `e2e/funnel.spec.ts` + `e2e/admin.spec.ts`: submit via demo → dossier shows **paid**
      in admin → flip « Devis envoyé » → reload persists. `shot()` at each. · done:
      `FEATURE=006-backend pnpm e2e:shots` green.
- [ ] T12 [P] (splittable PR) AC-10 cleanup — remove `/sign-in`, `/account`, `auth` slice,
      `profiles`/`notes` migrations+routes; fix middleware. · done: `pnpm verify` + e2e green, no
      dangling imports.
- [ ] T13 `pnpm verify` green; conventional commits.

## Phase 5 — review & ship

- [ ] T14 `/review` (frontend + appsec + qa); fix P0/P1 — focus: service-role never client-side,
      webhook signature, RLS deny-all, no PII in `/_next/static`.
- [ ] T15 `/security-review` (SEC-\*): env/secrets, route handler, service-role usage.
- [ ] T16 `/feature-report` → `docs/reports/006-backend.md`; PR (spec + report linked).
- [ ] T17 After merge: `/update-docs` (feature doc, CUJ-02/03, specs index → shipped).

## AC coverage (mirror of plan.md — keep in sync)

- [ ] AC-1 → T2 · [ ] AC-2 → T5c,T6,T9 · [ ] AC-3 → T6,T11 · [ ] AC-4 → T7 · [ ] AC-5 → T7,T8
- [ ] AC-6 → T10 · [ ] AC-7 → T9,T11 · [ ] AC-8 → T10,T11 · [ ] AC-9 → T7,T10 · [ ] AC-10 → T12

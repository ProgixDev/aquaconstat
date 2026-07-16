# Spec 004 — Espace administration

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
- **Date:** 2026-07-15
- **Slice / areas touched:** `src/features/admin/`, `src/app/admin/`, `src/app/globals.css`

## Problem (the why)

The professional needs a back-office to see paid dossiers, open the full constat detail
(coordonnées, assurance, questionnaire A/B/C, photos), and track each dossier's status from
Nouveau to Devis envoyé. Prototypes approved in Claude Design:

- `design/prototype/admin-connexion.dc.html` — login card + error state
- `design/prototype/admin-dossiers.dc.html` — searchable, filterable list with badges
- `design/prototype/admin-dossier-detail.dc.html` — detail with photo grid + lightbox

## R2R — 2026-07-16: real password gate + SLA cockpit (Houssem)

Two changes requested after delivery started. Both contradict what is written below, so the
original text is corrected in place rather than left to rot; the reasoning is recorded here.

**1. The back-office is closed for real (was: painted door).** Verified before the change:
`/admin/*` had no gate at all — the middleware protected only `/dashboard` and `/account`, the
login accepted any two non-empty fields client-side, and `/admin/dossiers` was reachable by
typing the URL. Worse, the dossier list was value-imported by a `"use client"` table, so all 9
records shipped in a public `/_next/static` chunk — a path the middleware matcher excludes, so
no gate could ever have covered it. Mock data today; the same shape with real dossiers is names,
addresses, phones and photos of people's homes (RGPD).

Mechanism: a shared password in `ADMIN_PASSWORD`, verified server-side, with an HMAC-signed
`httpOnly` session cookie. Not Supabase Auth — see ADR-0008 for why, and for the migration path.

**2. « Dossiers reçus » is organised around the 48 h ouvrées promise.** The approved prototype
`design/prototype/admin-dossiers.dc.html` is a flat table sorted by date, which cannot answer the
only question that matters at 9am: what is late? The list now leads with an SLA overview band and
orders by urgency. **This knowingly diverges from the approved prototype** — the prototype is no
longer the source of truth for this page.

## Desired behavior (the what)

`/admin/connexion` shows a centered login card. `/admin/dossiers` lists dossiers with search by
name/reference, status filter pills, Payé/Échoué and Nouveau/En cours/Devis envoyé badges, and
designed empty states (no dossiers at all; no search results with a clear-search action).
Clicking a row opens `/admin/dossiers/[ref]` with the full record in quiet utilitarian cards, a
status switcher, and a photo grid that opens a lightbox. Same tokens as the site, zero
decoration.

## Acceptance criteria

- **AC-1** The three pages render their prototype layout and French copy with mock data
  (9 dossiers, AC-2026-0144 → 0152).
- **AC-2** Search filters by name or reference (case-insensitive); status pills filter the list;
  the two empty states render (no results shows « Effacer la recherche » which resets).
- **AC-3** The detail page shows the AC-2026-0147 record's four sections; the status switcher
  updates the selected pill; photos open/close a lightbox (click anywhere to close).
- **AC-4** Badges use semantic tokens (success/destructive/info roles), never ad-hoc hex in
  components.
- **AC-5** (rewritten 2026-07-16 — was « login is a painted door ») Login is password-only and
  server-enforced. The correct `ADMIN_PASSWORD` sets an HMAC-signed `httpOnly` cookie and lands
  on the list; a wrong password, an empty field, and an unconfigured server all return the same
  generic « Mot de passe incorrect. » — distinguishing them tells an attacker which wall they
  hit. Unset secrets fail closed: the area is shut, never open.
- **AC-6** (added 2026-07-16) The gate holds against the client, not just the UI:
  - `/admin/dossiers` unauthenticated redirects to `/admin/connexion?next=…`;
  - a **forged cookie** passes the middleware (which only checks presence) and is still refused
    by the data layer — including for an RSC request whose `Next-Router-State-Tree` claims the
    layout is already mounted, which is why the check lives in `data.ts` and not in a layout;
  - « Déconnexion » clears the cookie server-side (it used to be a `<Link>` that navigated while
    leaving the session intact);
  - no dossier PII appears in any `/_next/static` chunk.
- **AC-7** (added 2026-07-16) « Dossiers reçus » leads with the SLA: an overview band (en retard /
  à rendre aujourd'hui / en attente / encaissé) and a list ordered by urgency — late first, then
  due-today, with sent and unpaid sinking. Each row states its deadline in words. An unpaid
  dossier is never « en retard »: the clock starts at payment. Sortable by demandeur / créé le /
  échéance, and the list reflows to cards below `md` rather than sitting behind a horizontal
  scroll.

## Out of scope

- **Per-user accounts** (Supabase Auth — ADR-0008 records the migration path). The shared
  password authenticates « whoever holds the secret », not a person: there is no audit trail of
  who opened which dossier, and no password reset without a redeploy. Acceptable for one
  operator; revisit before a second person gets access.
- Real dossier data, photo storage/download, e-mail actions.

## CUJ impact

Adds CUJ-03 « admin reviews a dossier » (internal user).

## Open questions

- **« 48 h ouvrées » — needs Nino.** Read as **2 jours ouvrés** (the standard French consumer
  reading), clock starting **at payment**. The other reading — 48 _working_ hours ≈ 6 working
  days — would change every deadline on the page. Isolated in `src/features/admin/sla.ts` behind
  one constant, with tests, so confirming or reversing it is a one-line change. French public
  holidays are not modelled, and the arithmetic is UTC rather than Europe/Paris — a dossier paid
  late evening can shift a day. Both must be revisited with the backend spec.
- **Session revocation.** With no database there is no revocation list: logout clears the cookie
  in that browser but cannot invalidate an issued token, so a stolen one is valid until it
  expires (8 h). Mitigated by deriving the signing key from the password — rotating
  `ADMIN_PASSWORD` invalidates every live session.
- **Rate limiting is best-effort** (SEC-RATE-001, P3): a per-instance in-memory counter, reset by
  a cold start. It slows a script; it does not stop one. The password's entropy is the real
  defence.

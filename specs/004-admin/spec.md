# Spec 004 — Espace administration

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (AquaConstat)
- **Date:** 2026-07-15
- **Slice / areas touched:** `src/features/admin/`, `src/app/admin/`, `src/app/globals.css`

## Problem (the why)

The professional needs a back-office to see paid dossiers, open the full constat detail
(coordonnées, assurance, questionnaire A/B/C, photos), and track each dossier's status from
Nouveau to Devis envoyé. Prototypes approved in Claude Design:

- `design/prototype/admin-connexion.dc.html` — login card + error state
- `design/prototype/admin-dossiers.dc.html` — searchable, filterable list with badges
- `design/prototype/admin-dossier-detail.dc.html` — detail with photo grid + lightbox

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
- **AC-5** Login is a painted door: submitting with both fields filled goes to the list;
  an empty field shows the « Identifiants incorrects » error card. Real auth is out of scope.

## Out of scope

- Real authentication/authorization (Supabase auth spec later — the skeleton's auth slice will
  back it), real dossier data, photo storage/download, e-mail actions.

## CUJ impact

Adds CUJ-03 « admin reviews a dossier » (internal user).

## Open questions

- None blocking.

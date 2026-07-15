# Spec 002 — Landing page (accueil)

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (AquaConstat)
- **Date:** 2026-07-15
- **Slice / areas touched:** `src/features/landing/`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/core/site.ts`, `e2e/home.spec.ts`

## Problem (the why)

AquaConstat sells remote water-damage quotes (149 € TTC, devis sous 48 h ouvrées) to
insurance-stressed homeowners arriving from Meta Ads on mobile. The product needs a
conversion-focused landing page that establishes trust instantly and funnels visitors into the
dossier flow. The design was prototyped in Claude Design and approved; the prototype and its
briefs are the source of truth:

- `design/prototype/accueil.dc.html` — the approved visual (recreate faithfully)
- `design/aquaconstat-design-prompt.md` — token contract, motion and accessibility rules
- `design/aquaconstat-content-prompt.md` — all French copy (do not invent or reorder content)

## Desired behavior (the what)

A visitor landing on `/` sees, in order: a pill header with logo, anchor nav and CTA; a navy
cinematic hero (badge, headline, subtext, two CTAs, price reassurance line, animated droplet
with two floating trust chips, stat row 48 h / 100 % / Stripe); an audience section (4 profile
cards); « Comment ça marche » (5 numbered steps); a photo-guidance section; a navy « Ce que vous
recevez » band with a mock devis PDF card; a single-card pricing section (149 €); testimonials +
4 mini-FAQ items; an interactive FAQ accordion (6 items, one open at a time); a final navy CTA
band; a navy footer. All copy is French with proper typography (« » ’ …). Every « Démarrer mon
dossier » CTA leads to the dossier funnel entry.

## Acceptance criteria

- **AC-1** `/` renders all 11 sections above in prototype order, with the exact French copy from
  the prototype.
- **AC-2** The FAQ accordion opens one item at a time; clicking an open item closes it;
  buttons are keyboard-operable with visible focus.
- **AC-3** Each « Démarrer mon dossier » CTA (header, hero, tarif, final band, footer) navigates
  to `/dossier` (painted-door stub until spec 003 ships the funnel).
- **AC-4** Anchor links (Comment ça marche, Tarif, FAQ) scroll to their sections.
- **AC-5** Droplet float/drift animations are disabled under `prefers-reduced-motion: reduce`;
  the hero headline renders without waiting for any animation asset.
- **AC-6** The page uses only design tokens defined in `globals.css` (no ad-hoc hex in
  components) and Playfair Display / Nunito via `next/font` (non-happy path: fonts blocked →
  system fallbacks render, layout intact).

## Out of scope

- The funnel steps (dossier, questionnaire, photos, paiement), confirmation, admin, and error
  pages — later specs, prototypes already in `design/prototype/`.
- The photoreal 3D GLB droplet (design brief §3): the prototype ships the CSS placeholder
  droplet; the Higgsfield asset pipeline is a separate design task. The placeholder is the
  approved fallback and must look complete on its own.
- Legal pages (mentions légales, CGV, confidentialité) — footer links are placeholders.

## CUJ impact

Replaces CUJ-01 (skeleton demo landing) with « land, understand, start a dossier ». The
task-list example remains reachable at `/examples/tasks` but is no longer linked from home.

## Open questions

- None blocking. GLB hero upgrade and real testimonials to be revisited before launch.

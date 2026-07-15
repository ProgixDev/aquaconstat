# Spec 003 — Funnel devis (étapes 1–4 + confirmation)

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (AquaConstat)
- **Date:** 2026-07-15
- **Slice / areas touched:** `src/features/funnel/`, `src/app/(funnel)/`, `src/app/globals.css`, `e2e/`

## Problem (the why)

The landing page (spec 002) sends visitors to « Démarrer mon dossier », which is a stub. The
product's core is the 4-step funnel: dossier → questionnaire → photos → paiement, then a
confirmation. Prototypes and copy are approved in Claude Design:

- `design/prototype/etape-1-dossier.dc.html` — coordonnées, lieu, statut, assurance
- `design/prototype/etape-2-questionnaire.dc.html` — sinistre (A), surfaces (B), états (C)
- `design/prototype/etape-3-photos.dc.html` — consignes + upload grid
- `design/prototype/etape-4-paiement.dc.html` — récapitulatif + carte (Stripe)
- `design/prototype/confirmation.dc.html` — ripple success + référence + « la suite »

## Desired behavior (the what)

A visitor moves through four light, single-column steps under a persistent droplet step
indicator with a thin gradient « liquid » progress bar (13 % → 38 % → 62 % → 88 %). Completed
steps become links back (« Dossier ✓ »). Answers persist while navigating between steps.
Conditional questions appear based on answers (syndic if copropriété/locatif, sous-questions
locataire/propriétaire, canalisation/infiltrations/autre cause, tiers responsable, surfaces per
selected pièce). Photos are added from the gallery/camera with previews, removable, with an
inline error for oversized files. The payment step shows a recap with « Modifier » links and a
sober card block; paying shows the confirmation page with a ripple droplet, a reference number
in display type, the « la suite » timeline, and the user's e-mail.

## Acceptance criteria

- **AC-1** Each step renders its prototype's sections, fields, and French copy; the step
  indicator reflects position and links back to completed steps; the progress bar widths match.
- **AC-2** Form state persists across step navigation (fill étape 1, go to étape 2, come back —
  values are still there) within a session.
- **AC-3** Conditional blocks follow the prototype logic: syndic field only for
  copropriété/locatif; locataire and propriétaire sub-panels; canalisation, infiltrations and
  « autre cause » sub-panels; « par qui ? » only when recherche de fuite = oui; tiers details
  only when oui; a surface block per selected pièce.
- **AC-4** Photos: selected images preview in a 4/3 grid, can be removed; files over 20 Mo show
  the inline error card with « Réessayer »; the counter line updates.
- **AC-5** The recap on étape 4 reflects entered data with « Modifier » links to the right
  steps; « Payer 149 € et envoyer mon dossier » leads to the confirmation page showing a
  generated AC-2026-NNNN reference and the entered e-mail (non-happy path: payment-declined
  error banner state exists and is testable).
- **AC-6** No real payment or upload backend: the card block is a painted door (Stripe
  integration is a later spec via the payments-stripe pack); no network calls leave the page.

## Out of scope

- Real Stripe payment, server-side dossier persistence, e-mail sending, file storage — backend
  spec later (payments-stripe pack + Supabase).
- Admin (spec 004). Hard validation gates between steps (only light inline validation).

## CUJ impact

Adds CUJ-02 « start and submit a dossier » replacing the task-list example journey as the
product's second critical journey.

## Open questions

- None blocking. Reference format AC-2026-NNNN is client-generated until the backend owns it.

# Spec 003 — Funnel devis (étapes 1–4 + confirmation)

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
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

## R2R — 2026-07-16: questionnaire cut to « Ultra-Light » (client)

Nino reviewed étape 2 and cut every question that does not change the price of the
embellishments being quoted. **Removed outright:** recherche de fuite (+ par qui), cause
identifiée, cause réparée, origine du dégât, tiers responsable (+ pourquoi / nom), the cause
checklist (canalisation / appareil / chéneaux / infiltrations / gel / autre) and its sub-panels,
état des revêtements, humidité, précisions libres. His reasoning, recorded verbatim so it is not
re-litigated:

- _Recherche de fuite_ — « Ça n'impacte pas le prix des peintures sur ton devis. »
- _Cause identifiée / réparée_ — « L'artisan ne réparera pas la fuite, il vient refaire les
  embellissements (peinture, sol). »
- _Origine_ — « C'est le rôle du constat amiable, pas du devis. »
- _Tiers responsable_ — « C'est de l'ordre de l'enquête d'assurance, aucun rapport avec ton devis
  de travaux. »

**Étape 2 is now:** date du sinistre (approximative) → pièces endommagées (Salon · Chambre ·
Cuisine · Salle de bain · Couloir/WC) → per selected pièce: « Que faut-il refaire ? » (plafond /
murs / sol) + taille approximative (petite < 10 m² · moyenne 10–20 m² · grande > 20 m²). Target:
under 2 minutes on a phone. Room size is a band, not longueur × largeur.

## R2R — 2026-07-16 (same day, follow-up): étape 1 de-risked for conversion

Answering the open question above, Nino cut étape 1 too — to stop people abandoning before they
pay. « De nombreux clients n'auront pas leur numéro de contrat ou de sinistre sous les yeux au
moment de faire la démarche en ligne, et ces informations ne sont pas obligatoires sur un devis de
travaux. »

- **Kept 100 %:** « Vos coordonnées » (prénom, nom, e-mail, téléphone) · « Le lieu du sinistre »
  (adresse, bât., étage, code postal, ville) · « Vous êtes » (locataire / propriétaire / syndic /
  gérant) — its sub-panels were later cut too (2026-07-16, client feedback: coordonnées du
  propriétaire, résiliation du bail, location meublée, occupant/non-occupant — none of it
  changes the price of the work).
- **Removed:** « L'immeuble a-t-il été construit depuis moins de 10 ans ? » · « Le local est-il à
  usage d'habitation ? » · the entire « Votre assurance » fieldset (assureur, n° de contrat, n° de
  sinistre, agent/courtier, adresse) — « un énorme point de blocage pour le client ».
- **Consequence:** the funnel no longer mirrors the « constat amiable dégât des eaux ». The intro
  banner and sub that promised it are gone from étape 1 — the page must not claim a correspondence
  that no longer exists. The admin « Assurance » card is gone for the same reason: nothing feeds
  it.

`typeLieu` (« Il s'agit de : ») and the syndic follow-up stay — Nino listed neither for removal,
and `typeLieu` is what reveals the syndic field.

## Desired behavior (the what)

A visitor moves through four light, single-column steps under a persistent numbered progress
bar: one circle per step (1–4) joined by connectors that fill as steps complete, the active
step highlighted, completed steps shown as ✓ circles that link back. Each step title carries a
reassuring « Étape N sur 4 · … » line (2 minutes / ≈ 2 minutes / 4 à 8 photos / Paiement
sécurisé Stripe). _(Revised 2026-07-16 — client feedback: the droplet step indicator + thin
« liquid » bar read as flat text on mobile, with no visible active step.)_ Answers persist
while navigating between steps.
Conditional questions appear based on answers (syndic if copropriété/locatif, and a « que
faut-il refaire ? » + taille block per selected pièce — the sous-questions
locataire/propriétaire were removed 2026-07-16, client feedback). Photos are added from the gallery/camera with previews, removable, with an
inline error for oversized files. The payment step shows a recap with « Modifier » links and a
sober card block; paying shows the confirmation page with a ripple droplet, a reference number
in display type, the « la suite » timeline, and the user's e-mail.

## Acceptance criteria

- **AC-1** Each step renders its prototype's sections, fields, and French copy; the numbered
  progress bar reflects position (active circle highlighted, done circles ✓ linking back,
  connectors filled up to the active step) and each title carries its « Étape N sur 4 · … »
  line. (Revised 2026-07-16 — replaces the droplet indicator + liquid bar widths.)
- **AC-2** Form state persists across step navigation (fill étape 1, go to étape 2, come back —
  values are still there) within a session.
- **AC-3** Conditional blocks: syndic field only for copropriété/locatif; and — per selected
  pièce only — a « Que faut-il refaire ? » block
  (plafond / murs / sol) plus an approximate size band. Deselecting a pièce hides its block.
  (Revised 2026-07-16 — the cause/origine/tiers sub-panels this AC used to require are gone,
  and so are the locataire/propriétaire sub-panels under « Vous êtes »; see
  the R2R note above.)
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

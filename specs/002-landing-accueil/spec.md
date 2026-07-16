# Spec 002 — Landing page (accueil)

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
- **Date:** 2026-07-15
- **Slice / areas touched:** `src/features/landing/`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/core/site.ts`, `e2e/home.spec.ts`

## Problem (the why)

Ôlala sells remote water-damage quotes (83,90 € TTC — revised 2026-07-16, client feedback, was
149 €; devis sous 48 h ouvrées) to
insurance-stressed homeowners arriving from Meta Ads on mobile. The product needs a
conversion-focused landing page that establishes trust instantly and funnels visitors into the
dossier flow. The design was prototyped in Claude Design and approved; the prototype and its
briefs are the source of truth:

- `design/prototype/accueil.dc.html` — the approved visual (recreate faithfully)
- `design/olala-design-prompt.md` — token contract, motion and accessibility rules
- `design/olala-content-prompt.md` — all French copy (do not invent or reorder content)

## Desired behavior (the what)

A visitor landing on `/` sees, in order: a pill header with logo, anchor nav and CTA; a navy
cinematic hero (badge, headline, two CTAs, animated droplet, centred stat row
48 h / 100 % / Stripe — no sub-paragraph and no CTA micro-copy); an audience section (4 profile
cards); « Comment ça marche » (5 numbered steps); a photo-guidance section; a navy « Ce que vous
recevez » band with a mock devis PDF card; a « Premiers clients » social-proof band (added
2026-07-16, client feedback); a navy « Réassurance » band (the 4 objections from the content
brief) — moved before the price on 2026-07-16 (client feedback: objections block the decision
before the visitor reaches the tarif); a compact pricing bar (83,90 €, with a market anchor);
an interactive FAQ accordion (6 items, one open at a time); a final navy CTA
band; a navy footer. All copy is French with proper typography (« » ’ …). Every « Démarrer mon
dossier » CTA leads to the dossier funnel entry.

## Acceptance criteria

- **AC-1** `/` renders all 11 sections above in prototype order, with the exact French copy from
  `design/olala-content-prompt.md` (the content brief, not the prototype HTML, is the copy
  source of truth — the hero sub and CTA micro-copy were revised there on 2026-07-15 to state
  each proof once).
- **AC-2** The FAQ accordion opens one item at a time; clicking an open item closes it;
  buttons are keyboard-operable with visible focus.
- **AC-3** Each « Démarrer mon dossier » CTA (header, hero, tarif, final band, footer) navigates
  to `/dossier` (painted-door stub until spec 003 ships the funnel).
- **AC-4** Anchor links (Comment ça marche, Tarif, FAQ) scroll to their sections.
- **AC-5** Droplet animations (float, scroll-driven fall, splash, return) and the hero entrance
  choreography are disabled under `prefers-reduced-motion: reduce` — the droplet renders as a
  static image; the hero headline renders without waiting for any animation asset.
- **AC-6** The page uses only design tokens defined in `globals.css` (no ad-hoc hex in
  components) and Playfair Display / Nunito via `next/font` (non-happy path: fonts blocked →
  system fallbacks render, layout intact).
- **AC-7** (added 2026-07-16) The pinned hero fits the viewport it is pinned to, at every
  height down to a 720p laptop: its content is centred in the space _below_ the fixed header,
  and nothing collides with the header or the « Faites défiler » cue. The hero's vertical
  rhythm (headline size, droplet height, gaps) scales with `svh` — a pinned `h-svh` section
  cannot hold a fixed-height content block. Verified by measuring, not eyeballing: at 1024×768,
  1280×720, 1440×780, 1440×900 and 1920×1080.
- **AC-8** (added 2026-07-16) No landing content is clipped at 320–430 px wide. Note that the
  page's `overflow-hidden` bands hide horizontal overflow instead of producing a scrollbar, so
  `scrollWidth` proves nothing — the check is that no text element's box escapes the viewport.
  Fixed-width children (e.g. the mock devis card) must be `w-full max-w-*`: inside a grid they
  otherwise set the track wider than the viewport and clip a _sibling_ column.
- **AC-9** (added 2026-07-16) Footer links are at least 24×24 CSS px (WCAG 2.5.8) and never
  overlap each other. Bare 14px text links are 20px tall and pass only via the criterion's
  spacing exception; the footer stays on the right side of that on size alone. The footer keeps
  one column below `sm` on purpose — a two-column nav at 320 px yields 120 px tracks against a
  168 px « Politique de confidentialité ».

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

- None blocking. GLB hero upgrade to be revisited before launch.
- **2026-07-16 — fabricated testimonials removed.** The build had shipped three invented customer
  quotes (« Camille M. · Lyon », « Karim H. · Marseille », « Élise F. · Dijon »). They were never
  in the content brief, the service has no customers, and publishing invented reviews is a
  _pratique commerciale trompeuse_ (Code de la consommation, art. L121-2 et s.). The slot is now
  the « Réassurance / objections » section the brief actually specifies. If Nino later obtains
  real, attributable testimonials, they need their own spec'd section — not a revival of these.

# Spec 005 — Pages légales (mentions légales, confidentialité, CGV)

- **Status:** active
- **Type:** feature
- **Requested by / owner:** Houssem (Progix) — client: Nino (Ôlala)
- **Date:** 2026-07-16
- **Slice / areas touched:** `src/features/legal/`, routes `/mentions-legales`, `/confidentialite`, `/cgv`, `src/app/sitemap.ts`

## Problem (the why)

The footer has linked to `/mentions-legales`, `/cgv` and `/confidentialite` since spec 002 — all
three were 404s. Since 2026-07-16 the payment page requires accepting the CGV via a mandatory
checkbox (spec 003), which is legally hollow while the CGV are unreadable. The client delivered
the full legal content (mentions légales, politique de confidentialité RGPD, CGV) on 2026-07-16.

## Content decisions (recorded so they are not re-litigated)

The client text is used verbatim wherever possible, with these resolved deviations:

- **Price: 82,90 € TTC** — the CGV (articles 3 and 7) state 82,90 €, while the site charged
  83,90 € (set earlier the same day). Confirmed with the owner: **82,90 € is the contractual
  figure**; the whole site was re-swept to match. History: 149 € → 83,90 € → 82,90 €, all
  2026-07-16.
- **Hébergeur: Vercel** — the client text left a placeholder; confirmed with the owner.
  Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
- **Contact e-mail: contact@olala.fr** — the placeholder is filled with the address already
  published in the footer.
- **Site URL:** the domain is not purchased yet (`site.isPublic` is fail-closed), so the legal
  text designates the site by its name — « le site Ôlala (ci-après « le Site ») » — instead of a
  URL. Revisit when the domain exists.
- **CGV article 5 quotes the real UI.** The client's draft quoted one combined consent sentence;
  the payment page (spec 003, decision 2026-07-16) uses two distinct express-consent checkboxes.
  Article 5 quotes both actual mentions so the contract describes the interface as built.
- Typo fixed: « LIVRAISON AND DÉLAIS » → « Livraison et délais d'exécution ».
- Typography normalised to the site's copy rules (« » ’ … , sentence-case headings).

Key legal facts carried by the content: éditeur BEERI CAPITAL (SAS, RCS Créteil 999 817 174,
Vincennes) · directrice de la publication Estelle Boudon · prestataire des devis SAS BATITEC
(SIRET 910 044 163 00012, Clichy) · données conservées 3 ans · renonciation au droit de
rétractation (art. L221-25) matérialisée par les deux cases de l'étape 4 · devis valable 3 mois ·
responsabilité plafonnée au prix payé.

## Desired behavior (the what)

A visitor opening `/mentions-legales`, `/confidentialite` or `/cgv` (from the footer, or the
payment step for the CGV) reads the corresponding document on a quiet, single-column page:
site logo linking home, the document title, numbered sections, and a minimal footer
cross-linking the three legal pages. No funnel chrome, no marketing sections. The pages are
static, indexable (once the domain exists), and listed in the sitemap.

## Acceptance criteria

- **AC-1** `/mentions-legales` renders éditeur, hébergeur, propriété intellectuelle and
  partenaire (BATITEC) sections with the facts above.
- **AC-2** `/confidentialite` renders the five RGPD sections (collecte, finalité, destinataires,
  conservation 3 ans, droits) and names the contact e-mail.
- **AC-3** `/cgv` renders the préambule and the ten articles; article 3 and article 7 state
  82,90 € TTC; article 5 quotes the two payment-page consent mentions verbatim.
- **AC-4** The three pages are reachable from the footer links and cross-link each other; each
  carries its own `<title>`.
- **AC-5** Non-happy path: a visitor on a legal page can always get back — the logo links to `/`
  and the page carries a « Retour à l'accueil » path.

## Out of scope

- A CGV link inside the payment checkbox label (the checkbox is a `<button role="checkbox">`;
  nesting a link is invalid HTML — revisit with the Stripe integration).
- Cookie banner / consent management (no tracking cookies exist today).
- Making the landing footer's anchor links (`#tarif`…) work from non-landing pages — noted as a
  separate quick-track fix.

## CUJ impact

- None new — supports CUJ-02 (the payment step's CGV consent now points at a real document).

## Open questions

- None blocking. The site-URL mention and the SEO go-live depend on the domain purchase
  (tracked in `src/core/site.ts`).

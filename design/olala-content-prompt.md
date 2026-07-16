# Claude Design — Ôlala · Content Brief (CONTENT ONLY)

> **How to use this document:** this is the single source of truth for the product, pages,
> structure, copy, fields, and states of the site. **Design direction, visual style, references
> and inspiration will be given separately in this conversation — do not invent an aesthetic from
> this document, and do not invent, remove, or reorder content.** All on-page copy is in French
> (French typography: ’ « » … —). Amounts in euros (€). Use the copy below verbatim where
> provided; where sample data is needed, use realistic French data — never lorem ipsum.

---

## 1. What this product is

**Ôlala** _(working name — final trade name to be confirmed)_ is a simple, responsive
French-market website that lets someone who has suffered a **dégât des eaux** (water damage) get
a **repair quote remotely, without a professional visiting**, to send to their insurance.

The visitor arrives from a **Meta ad (Facebook/Instagram, so ~mobile-first traffic)**, understands
the offer, creates a dossier, fills a structured questionnaire about the damage, uploads photos
from their phone, **pays by card via Stripe before submission**, and receives their quote by
e-mail within the announced delay. The professional (the site owner) reviews each dossier in a
**simplified admin area** and prepares the quote manually.

This is a conversion-focused MVP: one clear offer, one short path from ad click to payment.
Nothing else.

**Two users:**

- **The demandeur** — owner, tenant, landlord, property manager, or syndic dealing with water
  damage. Stressed, in a hurry, on a phone, needs a quote for their insurance without waiting
  for someone to come. Needs to be reassured before paying online.
- **The administrateur** — the professional who receives dossiers, checks payment, views answers
  and photos, and prepares the quote manually.

**Placeholders to keep visibly consistent everywhere (final values pending):**

- Price of the service: use **149 €** everywhere, treat as `[PRIX — à confirmer]`
- Delivery delay of the quote: use **sous 48 h ouvrées**, treat as `[DÉLAI — à confirmer]`
- Brand name: **Ôlala** `[nom de travail]`

---

## 2. Pages to design

**Public funnel (mobile-first, then scale up):**

1. Landing / page de présentation (the conversion page)
2. Étape 1 — Création du dossier (form)
3. Étape 2 — Questionnaire dégât des eaux (form, multi-part)
4. Étape 3 — Photos (multi-upload)
5. Étape 4 — Récapitulatif & paiement (Stripe)
6. Confirmation (post-payment)

**Admin (desktop-first but responsive):**

7. Connexion admin
8. Liste des dossiers
9. Détail d’un dossier

Plus: 404, 500, and the required states in §12.

The funnel (pages 2–5) shares a persistent **step indicator**: `Dossier → Questionnaire → Photos
→ Paiement`, with clear current/completed/upcoming states, and a reassurance line always visible
near the primary action: « Paiement sécurisé par Stripe · Devis envoyé sous 48 h ouvrées ».

---

## 3. Page 1 — Landing / Présentation

Goal: convert cold Meta Ads traffic. Everything answers three questions fast: _qu’est-ce que
c’est, combien ça coûte, pourquoi vous faire confiance._ One single primary CTA repeated down the
page: **« Démarrer mon dossier »**.

**Header (minimal):** logo Ôlala + CTA « Démarrer mon dossier ». No nav menu beyond an
anchor or two (Comment ça marche · Tarif · FAQ).

**Hero:**

- Eyebrow: « Dégât des eaux · Devis à distance »
- H1: « Votre devis dégât des eaux, sans attendre le passage d’un artisan »
- Sub: **none** _(Revised 2026-07-15 — the hero sub was cut. It had duplicated the whole page:
  its 48 h / à-distance / Stripe proofs repeated the trust row directly beneath it, and its
  process clauses repeat « Comment ça marche » steps 02, 03 and 05 plus « prêt à être transmis à
  votre assurance » in « Ce que vous recevez ». The headline states the offer, the trust row
  states the proof, and the process is told once, in full, where it belongs.)_
- Primary CTA: « Démarrer mon dossier » (+ secondary anchor « Comment ça marche »), with **no
  micro-copy underneath** _(Revised 2026-07-15 — the « 149 € · paiement sécurisé Stripe · sans
  création de compte » line was cut for a leaner hero. ⚠️ Open point: the price is therefore no
  longer visible in the hero, though §3 asks the landing to answer « combien ça coûte » fast. It
  is still stated in Tarif, in « Comment ça marche » step 04, and in the final CTA band.)_
- Trust row (3 items): « Devis sous 48 h ouvrées » · « Sans déplacement » · « Paiement sécurisé
  Stripe »

**Section — À qui s’adresse ce service :** one short intro line + 4 audience items.
_(2026-07-15 — the intro line this brief asks for had never been written, so the section shipped
without one. Drafted: « Un dégât des eaux ne prévient pas. La démarche, elle, est la même pour
tout le monde. » ⚠️ Not client-approved — replace if Nino has wording he prefers. Each item now
also carries a photo; the images are Unsplash placeholders pending real photography.)_
Items:
Propriétaire occupant · Locataire · Bailleur / agence · Gestionnaire ou syndic. One line each,
e.g. « Locataire — votre assurance vous demande un devis pour débloquer votre dossier. »

**Section — Comment ça marche (5 étapes):**
_(2026-07-15 — each step also shows a meta fact, labelled by kind so the set reads as one system:
Durée · 2 min / Durée · ≈ 5 min / À prévoir · 4 à 8 photos / Prix · 149 € TTC / Résultat · PDF par
e-mail. ⚠️ The meta facts and their labels are not in this brief and are not client-approved. The
section now closes on the « Démarrer mon dossier » CTA — previously it ended with no way to act.)_

1. « Créez votre dossier » — « Vos coordonnées et l’adresse du bien concerné. 2 minutes. »
2. « Décrivez le sinistre » — « Un questionnaire guidé : pièces touchées, surfaces, état des
   murs, plafonds et sols. »
3. « Ajoutez vos photos » — « Depuis la galerie ou l’appareil photo, en suivant nos consignes de
   prise de vue. »
4. « Payez en ligne » — « 149 € par carte bancaire, dans l’environnement sécurisé de Stripe. »
5. « Recevez votre devis » — « Un devis détaillé, préparé par un professionnel, envoyé par
   e-mail sous 48 h ouvrées. »

**Section — Ce que vous recevez :** « Un devis détaillé des travaux de remise en état, établi
par un professionnel à partir de votre questionnaire et de vos photos, au format PDF, prêt à être
transmis à votre assurance. » (3 bullets: chiffrage poste par poste · document daté et signé ·
recevable par votre assurance).

**Section — Tarif (single offer, no plan grid):** price block « 149 € — tout compris », with:
étude complète de votre dossier · devis détaillé sous 48 h ouvrées · échange par e-mail si une
précision est nécessaire. Note: « Paiement unique, aucun abonnement. » CTA again.

**Section — Réassurance / objections (4 items):**
_(2026-07-16 — this section is now built as specified. It previously sat beneath three invented
testimonials that this brief never asked for; those are deleted (see specs/002). Heading drafted:
« Ce qu’on se demande avant de payer. » ⚠️ Not client-approved — the brief gives no heading for
this section. The four items below are used verbatim.)_

- « Et si mes photos ne suffisent pas ? » — « Nous revenons vers vous par e-mail pour toute
  précision, sans surcoût. »
- « Le devis sera-t-il accepté par mon assurance ? » — « Le devis est établi par un
  professionnel du bâtiment, détaillé poste par poste, comme un devis classique. »
- « Mes données et mon paiement sont-ils protégés ? » — « Le paiement s’effectue chez Stripe ;
  nous ne stockons jamais votre carte. Vos photos ne servent qu’à l’étude de votre dossier. »
- « Dois-je créer un compte ? » — « Non. Un dossier, un paiement, un devis. C’est tout. »

**FAQ (accordion, 6 questions):** délai exact · types de sinistres couverts (fuite, infiltration,
débordement, rupture de canalisation) · que faire si je ne connais pas les dimensions exactes
(« des dimensions approximatives suffisent ») · remboursement si le dossier ne peut pas être
traité · zone couverte (France métropolitaine) · comment le devis est-il envoyé (PDF par e-mail).

**Final CTA band:** « Votre assurance attend un devis ? Il vous faut 10 minutes. » + CTA.

**Footer:** logo, « Ôlala — devis dégât des eaux à distance », liens : Mentions légales ·
CGV · Politique de confidentialité · Contact (e-mail). Mention « Paiement sécurisé par Stripe ».

---

## 4. Page 2 — Étape 1 · Création du dossier

> **REVISED 2026-07-16 — per Nino, for conversion.** The constat-amiable framing below is
> withdrawn: étape 1 no longer mirrors that form, so it must not claim to. « De nombreux clients
> n'auront pas leur numéro de contrat ou de sinistre sous les yeux au moment de faire la démarche
> en ligne, et ces informations ne sont pas obligatoires sur un devis de travaux. » **Removed:**
> the « moins de 10 ans » question, the « usage d'habitation » question, and the entire
> « Votre assurance » fieldset. Rationale in `specs/003-funnel-devis/spec.md`.

Short, low-friction, no account creation. Title: « Créons votre dossier ». Sub: « Ces
informations figureront sur votre devis. »

**Fieldset « Vos coordonnées »:** Prénom · Nom · E-mail (« votre devis sera envoyé à cette
adresse ») · Téléphone.

**Fieldset « Le lieu du sinistre »:** Adresse complète · Bât. (facultatif) · Étage (facultatif) ·
Code postal · Ville · « Il s’agit de : » (choix unique — Maison particulière · Immeuble en
copropriété · Immeuble locatif) · Nom, adresse et téléphone du syndic ou du gérant (facultatif,
shown when copropriété/locatif is selected).

**Fieldset « Vous êtes » (choix unique, aligned on the constat amiable):**

- Locataire ou occupant non propriétaire → reveals: nom et coordonnées du propriétaire ou du
  gérant du logement + « La résiliation du bail a-t-elle été demandée ? » (oui / non) +
  « S’agit-il d’une location meublée ou saisonnière ? » (oui / non)
- Propriétaire / copropriétaire → occupant / non occupant
- Syndic de copropriété
- Gérant de l’immeuble / agence

**Fieldset « Votre assurance »:** _removed 2026-07-16 — see the note at the top of this section._

Required unless marked facultatif; inline validation, e-mail/phone format hints. Primary action:
« Continuer vers le questionnaire ». Sample data: « Camille Moreau · camille.moreau@gmail.com ·
06 42 17 89 03 · 12 rue des Lilas, Bât. B, 3ᵉ étage, 69003 Lyon · Immeuble en copropriété ·
Locataire ».

---

## 5. Page 3 — Étape 2 · Questionnaire dégât des eaux

> **REVISED 2026-07-16 — « Ultra-Light », per Nino.** The constat-amiable questionnaire below was
> cut: it asked about the leak, not about the work being quoted. Everything that does not change
> the price of the embellishments is gone — recherche de fuite, cause identifiée/réparée, origine,
> tiers responsable, the cause checklist and its sub-panels, état des éléments, humidité, and the
> free-text précisions. His words: « L'artisan ne réparera pas la fuite, il vient refaire les
> embellissements (peinture, sol) » ; « L'origine, c'est le rôle du constat amiable, pas du
> devis. » Target: under 2 minutes on a phone. Full rationale in `specs/003-funnel-devis/spec.md`.

The heart of the product: it must feel guided and effortless on a phone. Title: « Décrivez votre
dégât des eaux ». Sub: « Vos réponses permettent au professionnel d’établir le devis sans se
déplacer. Des valeurs approximatives suffisent. »

**Les infos de base:**

- Date du sinistre (approximative)
- (L’adresse du sinistre est déjà saisie à l’étape 1 — elle sert d’en-tête au devis.)

**Les pièces touchées (dynamique):** « Cochez la ou les pièces endommagées : » — Salon · Chambre ·
Cuisine · Salle de bain · Couloir/WC.

For each selected pièce, and only for it:

- « Que faut-il refaire ? » — Le plafond · Les murs · Le sol (multi-choix)
- « Taille de la pièce (approximative) : » — Petite (moins de 10 m²) · Moyenne (10 à 20 m²) ·
  Grande (plus de 20 m²)

Primary action: « Continuer vers les photos ». Sample data: « 14 juin 2026 · salle de bain
(plafond + murs, moyenne) · couloir/WC (murs, petite) ».

---

## 6. Page 4 — Étape 3 · Photos

> **REVISED 2026-07-16 — copy supplied by Nino, used verbatim.** The photos now carry the damage
> assessment the cut questionnaire used to ask about, so this page had to say what matters and
> defuse the « my photos won't be good enough » worry.

Title: « Ajoutez vos photos ». Sub: « Elles permettront à l’artisan de chiffrer précisément les
travaux sans se déplacer. Ne vous inquiétez pas pour la qualité : de simples photos avec votre
téléphone suffisent largement. »

**Consignes de prise de vue (comptez 4 à 8 photos) — checklist, always visible:**

- « De loin : Une vue générale de chaque pièce touchée (pour voir le volume). »
- « De près : Les zones endommagées (murs, plafond, sol) pour bien voir les détails des dégâts. »

Uploader helper: « Formats acceptés : JPG, PNG ou HEIC · 20 Mo max par photo ». Under the preview
grid: « Au moins 1 photo est requise pour passer à l’étape suivante. »

_(Nino's earlier help line — « Prenez en photo les taches, moisissures ou cloques de peinture. » —
is dropped: this rewrite replaces the consignes block and its « De près » item covers the same
ground. Restore it if he wants the specific damage cues named.)_

**Uploader:** « Depuis la galerie ou l’appareil photo » — multi-file, thumbnail previews, per-file
remove (« Supprimer »), per-file upload progress, error state for oversized/unsupported files
with plain-language recovery. Minimum 1 photo required to continue. Primary action: « Continuer
vers le paiement ».

---

## 7. Page 5 — Étape 4 · Récapitulatif & paiement

Title: « Vérifiez et payez ». Two zones:

**Récapitulatif:** dossier summary (coordonnées, adresse, origine du sinistre, pièces, nombre de
photos) with per-section « Modifier » links back into the funnel.

**Paiement:** line item « Étude du dossier & devis détaillé — 149 € », total « 149 € TTC », then
the Stripe card payment area, button « Payer 149 € et envoyer mon dossier ». Legal micro-copy: «
En payant, vous acceptez nos CGV. Votre dossier n’est transmis qu’une fois le paiement confirmé. »
Reassurance line: « Paiement sécurisé par Stripe — votre carte n’est jamais stockée par
Ôlala. » Error state: payment declined, inline, with retry — the dossier is never lost.

---

## 8. Page 6 — Confirmation

Success page: « Merci Camille, votre dossier est envoyé ✓ » · « Référence : AC-2026-0147 » ·
« Vous recevrez votre devis par e-mail à camille.moreau@gmail.com sous 48 h ouvrées. » · what
happens next (3 short steps: étude du dossier → préparation du devis → envoi par e-mail) · « Une
question ? Répondez simplement à l’e-mail de confirmation. » Mention that a confirmation e-mail
has been sent.

---

## 9. Page 7 — Connexion admin

Plain, utilitarian sign-in: « Espace administration » — E-mail · Mot de passe · « Se connecter ».
Error state for wrong credentials. No sign-up, no password-reset flow beyond a « Contacter Progix »
line _(single known administrator)_.

---

## 10. Page 8 — Admin · Liste des dossiers

Title: « Dossiers reçus ». A table/list (cards on mobile) — columns: Référence (AC-2026-0147) ·
Nom du demandeur · Ville · Date de création · Paiement (Payé ✓ / Échoué) · Statut de traitement
(Nouveau / En cours / Devis envoyé — manually set). Search by name/référence, filter by statut.
Row click → détail. Realistic sample rows (8–10 dossiers, varied French names/cities/dates,
mostly « Payé », one « Échoué »). Empty state: « Aucun dossier pour le moment — les dossiers
apparaîtront ici dès la première commande payée. »

---

## 11. Page 9 — Admin · Détail d’un dossier

Header: référence + demandeur + date + payment badge + statut selector (Nouveau / En cours /
Devis envoyé). Sections:

- **Coordonnées & lieu du sinistre** — nom, e-mail, téléphone, adresse complète (bât., étage),
  type de bâtiment, usage d’habitation, statut du demandeur (avec propriétaire/gérant, bail,
  meublée/saisonnière le cas échéant), syndic ou gérant.
- **Assurance** — assureur, n° de contrat, n° de sinistre, agent/courtier.
- **Réponses au questionnaire** — grouped exactly like the questionnaire (cause du sinistre au
  format constat amiable, surfaces, état des éléments, précisions libres), scannable label/value
  layout.
- **Photos** — grid of thumbnails, lightbox view, « Télécharger » per photo and « Tout
  télécharger ».
- **Paiement** — montant (149 €), date, statut Stripe.

Reminder note for context (not necessarily on screen): the professional prepares the quote in his
own tool and sends it by e-mail — no quote-builder exists in this product.

---

## 12. Required states (every page)

Empty (purpose + one CTA) · loading (skeleton/shimmer, not a bare spinner) · error (inline,
plain-language French, with a recovery path) · success. Funnel-specific: field validation errors,
photo-upload failure, Stripe payment declined, session-resume friendliness (copy never blames the
user). Plus 404 (« Cette page n’existe pas — retour à l’accueil ») and 500 (« Une erreur est
survenue — vos données ne sont pas perdues, réessayez »).

---

## 13. Out of scope — do not design

Native mobile app · automatic photo analysis or AI estimation · automatic quote generation ·
multi-artisan marketplace · real-time chat · multilingual versions · subscriptions/CRM · customer
account area. The MVP is exactly the funnel + the simplified admin above.

---

_Design direction, palette, typography, references and inspiration follow in the next message —
wait for them before rendering._

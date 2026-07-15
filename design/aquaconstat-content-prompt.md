# Claude Design — AquaConstat · Content Brief (CONTENT ONLY)

> **How to use this document:** this is the single source of truth for the product, pages,
> structure, copy, fields, and states of the site. **Design direction, visual style, references
> and inspiration will be given separately in this conversation — do not invent an aesthetic from
> this document, and do not invent, remove, or reorder content.** All on-page copy is in French
> (French typography: ’ « » … —). Amounts in euros (€). Use the copy below verbatim where
> provided; where sample data is needed, use realistic French data — never lorem ipsum.

---

## 1. What this product is

**AquaConstat** _(working name — final trade name to be confirmed)_ is a simple, responsive
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
- Brand name: **AquaConstat** `[nom de travail]`

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

**Header (minimal):** logo AquaConstat + CTA « Démarrer mon dossier ». No nav menu beyond an
anchor or two (Comment ça marche · Tarif · FAQ).

**Hero:**

- Eyebrow: « Dégât des eaux · Devis à distance »
- H1: « Votre devis dégât des eaux, sans attendre le passage d’un artisan »
- Sub: « Décrivez votre sinistre, ajoutez vos photos, et recevez sous 48 h ouvrées un devis
  détaillé à transmettre à votre assurance. 100 % en ligne, depuis votre téléphone. »
- Primary CTA: « Démarrer mon dossier » + micro-copy underneath: « 149 € · paiement sécurisé
  Stripe · sans création de compte »
- Trust row (3 items): « Devis sous 48 h ouvrées » · « Sans déplacement » · « Paiement sécurisé
  Stripe »

**Section — À qui s’adresse ce service :** one short intro line + 4 audience items:
Propriétaire occupant · Locataire · Bailleur / agence · Gestionnaire ou syndic. One line each,
e.g. « Locataire — votre assurance vous demande un devis pour débloquer votre dossier. »

**Section — Comment ça marche (5 étapes):**

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

**Footer:** logo, « AquaConstat — devis dégât des eaux à distance », liens : Mentions légales ·
CGV · Politique de confidentialité · Contact (e-mail). Mention « Paiement sécurisé par Stripe ».

---

## 4. Page 2 — Étape 1 · Création du dossier

Short, low-friction, no account creation. Title: « Créons votre dossier ». Sub: « Ces
informations figureront sur votre devis — les mêmes que celles demandées par votre assurance. »

> The information collected in Étape 1 + Étape 2 mirrors the official French **« Constat amiable
> dégât des eaux »** form, so the demandeur can reuse his answers with his insurer and the devis
> matches what the insurance expects. Keep every field below.

**Fieldset « Vos coordonnées »:** Prénom · Nom · E-mail (« votre devis sera envoyé à cette
adresse ») · Téléphone.

**Fieldset « Le lieu du sinistre »:** Adresse complète · Bât. (facultatif) · Étage (facultatif) ·
Code postal · Ville · « Il s’agit de : » (choix unique — Maison particulière · Immeuble en
copropriété · Immeuble locatif) · « L’immeuble a-t-il été construit depuis moins de 10 ans ? »
(oui / non / je ne sais pas) · « Le local est-il à usage d’habitation ? » (oui / non) · Nom,
adresse et téléphone du syndic ou du gérant (facultatif, shown when copropriété/locatif is
selected).

**Fieldset « Vous êtes » (choix unique, aligned on the constat amiable):**

- Locataire ou occupant non propriétaire → reveals: nom et coordonnées du propriétaire ou du
  gérant du logement + « La résiliation du bail a-t-elle été demandée ? » (oui / non) +
  « S’agit-il d’une location meublée ou saisonnière ? » (oui / non)
- Propriétaire / copropriétaire → occupant / non occupant
- Syndic de copropriété
- Gérant de l’immeuble / agence

**Fieldset « Votre assurance » (helper: « ces informations figurent sur votre contrat ou votre
déclaration de sinistre »):** Assureur · N° de contrat · N° de sinistre (facultatif — « si votre
sinistre est déjà déclaré ») · Agent ou courtier + téléphone (facultatif) · Adresse de
l’assureur / agent / courtier (facultatif).

Required unless marked facultatif; inline validation, e-mail/phone format hints. Primary action:
« Continuer vers le questionnaire ». Sample data: « Camille Moreau · camille.moreau@gmail.com ·
06 42 17 89 03 · 12 rue des Lilas, Bât. B, 3ᵉ étage, 69003 Lyon · Immeuble en copropriété ·
Locataire · MAIF · contrat n° 4 582 917 K · sinistre n° 2026-DDE-08341 ».

---

## 5. Page 3 — Étape 2 · Questionnaire dégât des eaux

The heart of the product: it must feel guided and effortless on a phone. Title: « Décrivez votre
dégât des eaux ». Sub: « Vos réponses permettent au professionnel d’établir le devis sans se
déplacer. Des valeurs approximatives suffisent. » Grouped in 3 parts (steps or clearly separated
groups):

**Partie A — Le sinistre (cause structure identical to the constat amiable):**

- Date du dégât des eaux (ou « date approximative »)
- « Une recherche de fuite a-t-elle été effectuée par un artisan ou une entreprise ? » — non /
  oui, par qui (champ texte)
- « La cause est-elle identifiée ? » (oui / non) · « La cause est-elle réparée ? » (oui / non)
- « L’origine du dégât des eaux est située : » — chez moi / chez un voisin / dans les parties
  communes / ailleurs, préciser
- « Il s’agit de : » (multi-choix, cocher la ou les cases) :
  - Fuite sur canalisation — préciser : commune / privative · alimentation / évacuation ·
    accessible / non accessible
  - Fuite ou débordement d’un appareil à effet d’eau (évier, lavabo, machine à laver, chaudière,
    cumulus…)
  - Fuite ou débordement de chéneaux ou de gouttières
  - Infiltrations par : toiture · terrasse · façade · fenêtre ou porte-fenêtre · joint
    d’étanchéité (installation sanitaire ou carrelage)
  - Gel
  - Autre cause : laquelle ? (champ texte)
- « Un entrepreneur, un installateur ou un vendeur vous paraît-il être à l’origine du
  sinistre ? » — non / oui, préciser pourquoi + nom et adresse (facultatif)
- Pièces concernées (multi-choix : salle de bain, cuisine, salon, chambre, couloir, WC, autre).

**Partie B — Surfaces endommagées (per selected room or globally):** Murs / Plafonds / Sols
(multi-choix) + dimensions approximatives (longueur × largeur en mètres, champs numériques avec
suffixe « m »). Helper: « Une estimation à 20 cm près suffit. »

**Partie C — État des éléments:** Peintures · Revêtements muraux · Plinthes · Parquet ou
carrelage · Traces d’humidité ou moisissures — each with a simple severity choice (Intact /
Abîmé / À refaire) or oui/non where relevant, plus a free-text « Précisions utiles (facultatif) ».

All required except free text and fields marked facultatif. Show progress. Primary action:
« Continuer vers les photos ». Sample data: « 14 juin 2026 · recherche de fuite : non · cause
identifiée : oui, réparée : non · origine : chez un voisin · fuite sur canalisation privative,
évacuation, non accessible · salle de bain + couloir · plafond salle de bain 2,1 × 1,8 m ·
peintures à refaire · traces d’humidité : oui ».

---

## 6. Page 4 — Étape 3 · Photos

Title: « Ajoutez vos photos ». Sub: « Elles sont consultées par le professionnel pour affiner le
devis. Comptez 4 à 8 photos. »

**Consignes de prise de vue (checklist, always visible):** une vue générale de chaque pièce
touchée · les zones endommagées de près · les murs · le plafond · le sol.

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
AquaConstat. » Error state: payment declined, inline, with retry — the dossier is never lost.

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

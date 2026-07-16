# Claude Design — Ôlala · Design Direction (paste AFTER the content brief)

> You already received the **content brief** (pages, structure, all French copy, fields, states).
> It is the single source of truth for content — do not invent, remove, or reorder content. This
> message defines **how it must look and move**. Attached: 2 reference images + 1 motion
> reference. Apply the system below consistently — do not invent a new aesthetic per page.

## 0. Role

You are a senior product designer with a print-design background who obsesses over spacing,
hierarchy, and restraint, designing a responsive, conversion-focused web funnel. Premium design
is a small, fixed, named system applied consistently — avoid statistical-average AI defaults.

## 1. Tone (4 words)

**Aquatique · rassurant · premium · net.** This is an insurance-adjacent service bought under
stress: the wow factor lives in the hero; everything below it must feel calm, credible, and
effortless. Emotional register: "a serious professional, beautifully presented" — never playful,
never corporate-boring.

## 2. Reference anchors — borrow the visual, not the function

- **Image 1 (« world of water » landing):** borrow the **fresh aqua→teal gradient panel set
  against generous off-white**, the organic blob/fluid shapes used sparingly as background
  accents, the airy stat row with thin vertical separators (reuse for our trust row: « devis sous
  48 h ouvrées · sans déplacement · paiement sécurisé Stripe »), and the idea of **one hero
  object: a glass water droplet with something suspended inside**. Borrow its lightness — not its
  literal nav or "buy water" blob button.
- **Image 2 (boat rental hero):** borrow the **deep navy, full-bleed atmospheric hero** with
  elegant thin-outline container, the **wide-tracked display typography over imagery**, and
  especially the **floating white search bar overlapping the hero's bottom edge** — reinterpret
  that as our CTA bar: « Démarrer mon dossier — 149 € · devis sous 48 h ouvrées » docked at the
  hero/content seam. Borrow its depth and cinematic confidence — not its booking-form fields.
- **Video (Dribbble motion reference):** borrow the **scroll-driven 3D behavior** — one signature
  3D object that lives in the hero and responds to scroll with smooth, physical, unhurried
  motion, creating continuity between the hero and the next section. Borrow the choreography
  feel — not its subject or colors.

**Cultural anchor:** macro water photography — caustics, refraction, surface tension; the
precision of a glass laboratory droplet, not a cartoon splash.

## 3. Signature hero — 3D scroll-animated droplet (landing only)

The hero's centerpiece is a **photoreal glass water droplet (real 3D model)**, refracting light,
with a faint interior suggestion of a repaired interior wall / calm water.

**Asset pipeline — use the Higgsfield connector to produce the actual 3D asset:**

1. **Concept renders first:** with Higgsfield `generate_image`, create 2–3 droplet concepts —
   a single photoreal glass water droplet, centered, front-facing, studio-lit with soft caustics,
   on a clean neutral/dark background, no text, no scene clutter (a clean isolated subject
   converts best to 3D). Palette must respect the token contract: aqua/teal glass, deep navy
   environment reflections. **Stop and show me the concepts — I pick one before any 3D
   generation.**
2. **Convert the chosen render** to a 3D mesh with Higgsfield `generate_3d` (GLB). Only convert
   the approved concept — one conversion, not three.
3. **Poster/fallback from the same source:** derive the static hero fallback from the chosen
   render (Higgsfield `remove_background` for a clean cutout if needed, `upscale_image` for the
   final poster) so the 3D and its fallback are visually identical.
4. **Integrate the GLB in the hero** with scroll-scrubbed animation. Note: the GLB is a static
   mesh — all motion is authored in the page (rotation, position, scale, lighting driven by
   scroll progress), not baked into the model.

**Behavior:**

- **On load:** droplet floats with a barely-perceptible idle motion (slow rotation, micro
  bobbing); light caustics shift. Headline and CTA render instantly — the 3D must never delay or
  push the text (no layout shift; text is the LCP; the poster shows first, the GLB fades in when
  streamed, the droplet scales in after).
- **On scroll (scrubbed to scroll position, not time):** the droplet rotates and travels
  downward, escorting the user from the hero into « Comment ça marche », where it settles beside
  step 1, then dissolves into a flat brand shape (the small droplet glyph reused as step markers
  / section bullets). One continuous story: _the drop becomes the process._
- **Restraint rules:** this is the ONE signature moment of the site. No other 3D anywhere — and
  no other Higgsfield media on funnel pages. Funnel pages (dossier → questionnaire → photos →
  paiement) use only the flat droplet glyph and subtle 2D motion — a person paying 149 € under
  stress needs speed and clarity, not spectacle.
- **Fallbacks (design them):** the static poster render for `prefers-reduced-motion`, low-power
  devices, and while the model streams; the layout must look complete with the poster alone.
  Mobile gets a lighter version (shorter travel, same story, poster-first).
- **Performance budget:** keep the GLB lean (aim well under ~2 MB; simplify if heavier),
  lazy-load it after first paint, and never block interaction on it.

## 4. Design-token contract (use ONLY these roles — no ad-hoc values)

- **Color roles (60-30-10; no pure black/white; WCAG AA 4.5:1 text / 3:1 UI):**
  - `background` — off-white with a cool cast (paper, not #fff)
  - `foreground` — deep marine navy (ink, not #000)
  - `primary` — one saturated aqua/cyan (CTA, active, focus only) with an aqua→teal gradient
    variant reserved for the hero panel and primary CTA
  - `secondary` — deep navy surface (hero, footer, dark bands)
  - `muted` — cool grey-blue for helper text, borders, dividers
  - `accent-tint` — pale mint/aqua wash for info callouts, selected states, blob shapes
  - `destructive` / `success` — semantic; success leans teal-green (used for « Payé ✓ », valid
    fields, confirmation)
  - Dark mode: designed independently — dark navy-grey base + desaturated aqua, never inverted
    hex. Light is the primary theme; dark must still pass AA.
- **Type:** one modular scale (~1.25, base 16). A **distinctive display face** with wide-tracked
  uppercase available for hero/eyebrows (echoing Image 2) + a clean humanist body face for forms
  and legal copy. Max 2 weights; de-emphasize via color/size, not extra weights. Never
  Inter/Arial/system as the brand face. French typography throughout (’ « » … —).
- **Spacing:** 4/8 grid; generous whitespace (start with too much, remove later); one container
  max-width; comfortable tap targets (≥44px) — this funnel is majority-mobile Meta traffic.
- **Radii & depth:** one radius scale — soft, water-worn corners (generous on cards/CTA, subtle
  on inputs); ONE elevation system with **layered, cool navy-tinted shadows** (never a single
  pure-black blur). Optional signature: a faint inner "meniscus" highlight on primary surfaces.
- **Motion:** 150–300ms UI motion; real easing; exits faster than enters; scroll-scrubbed hero as
  the one signature transition; animate transform/opacity only; respect
  `prefers-reduced-motion` globally.

## 5. Per-surface intent

- **Landing:** navy cinematic hero (Image 2 depth) → light, airy body (Image 1 freshness). Blob
  shapes only as quiet background accents; stat/trust row with thin separators; pricing block as
  a single confident card, not a plan grid; FAQ as clean accordion; final CTA band on the
  aqua→teal gradient.
- **Funnel steps:** light theme, single-column, one fieldset visible at a time feel; persistent
  step indicator using droplet glyphs; reassurance line always near the primary button; progress
  feels liquid (a thin gradient fill, not a chunky bar).
- **Payment:** the most sober screen of the site — maximum whitespace, Stripe area framed
  quietly, trust micro-copy adjacent to the pay button.
- **Confirmation:** the one allowed moment of delight after the hero — a gentle droplet-ripple
  success mark (2D), reference number in display type.
- **Admin:** same tokens, utilitarian density, zero decoration — status badges (Payé/Échoué,
  Nouveau/En cours/Devis envoyé) use the semantic roles; photo grid with lightbox.

## 6. Required states & accessibility (non-negotiable)

Every page: empty, loading (skeleton/shimmer — never a bare spinner), inline plain-French error
with recovery, success. Payment-declined, upload-failure, 404/500 designed. Full keyboard nav
with **visible focus rings** (aqua ring on navy, navy ring on light); semantic landmarks/heading
order; labels on every field; color never the only signal; no layout shift (reserve space for
the 3D and images).

## 7. DO NOT

- No purple/indigo gradients, no default Tailwind palette, no default shadcn neutral theme.
- No Inter/Arial/system as brand face; no lorem ipsum (the content brief has all real copy).
- No three-icon-box features row; no center-everything layouts; no shadow soup / nested cards.
- No pure black or pure white; no stock photos of flooded living rooms or crying homeowners; no
  cartoon water mascots.
- No 3D outside the landing hero; nothing that delays the hero headline/CTA render.

## 8. Process

Work in passes: (1) layout & hierarchy → (2) tokens/theme → (3) content & states → (4) hero
asset — Higgsfield concepts → my pick → `generate_3d` → scroll integration (§3 pipeline) → (5)
motion/polish → (6) responsive at 375 / 768 / 1440 (mobile-first — most traffic is
Facebook/Instagram mobile). **Start with 3 distinct directions for the landing hero only**
(same content, same token roles, different expression: A — navy-cinematic like Image 2; B —
light-aqua editorial like Image 1; C — hybrid: navy hero band inside a light page); mock the
droplet with a placeholder render at this stage — generate the real Higgsfield asset only after
I pick a direction. After I pick one, roll it out to all pages, then self-critique against this
brief and list refinements.

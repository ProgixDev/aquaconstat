import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// A minimal valid 1×1 JPEG — enough for the store to accept a « live » photo
// (no EXIF, so it lands undated, which the funnel tolerates).
const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////" +
    "//////////////////////////////////////////////////////wAALCAABAAEB" +
    "AREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAI" +
    "AQEAAD8AfwD/2Q==",
  "base64",
);

// CUJ-02 — Start and submit a dossier (specs/003-funnel-devis/spec.md).
// Every step CTA is gated on completeness (validation.ts), so the happy path
// must fill every required field before it can advance.
test("@cuj CUJ-02: visitor fills the funnel and reaches confirmation", async ({ page }) => {
  // Étape 1 — dossier. All of coordonnées + lieu + statut are required to leave.
  await page.goto("/dossier");
  await expect(page.getByRole("heading", { name: "Créons votre dossier" })).toBeVisible();
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel("Nom", { exact: true }).fill("Moreau");
  await page.getByLabel("E-mail").fill("camille.moreau@gmail.com");
  await page.getByLabel("Adresse complète").fill("12 rue des Lilas");
  await page.getByLabel("Code postal").fill("75011");
  await page.getByLabel("Ville").fill("Paris");
  await page.getByRole("radio", { name: "Immeuble en copropriété" }).click();
  await page.getByRole("radio", { name: "Locataire ou occupant non propriétaire" }).click();
  await shot(page, "funnel-etape-1");

  // Étape 2 — « Ultra-Light »: date, pièces, and a per-pièce block that only
  // exists once that pièce is selected. Each checked part gets its own m² field
  // (client, 2026-07-21).
  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await expect(page.getByRole("heading", { name: "Décrivez votre dégât des eaux" })).toBeVisible();
  await page.getByLabel("Date du sinistre déclaré à votre assureur").fill("2026-06-14");
  await expect(page.getByText("Que faut-il refaire ?")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByText("Que faut-il refaire ?")).toBeVisible();
  await page.getByRole("checkbox", { name: "Le plafond" }).click();
  await page.getByLabel("Surface touchée au plafond (m², approximative)").fill("12");
  await shot(page, "funnel-etape-2");

  // Deselecting the pièce takes its block away with it; re-selecting restores
  // the persisted answer — plafond still checked, its m² kept.
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByText("Que faut-il refaire ?")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByRole("checkbox", { name: "Le plafond" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByLabel("Surface touchée au plafond (m², approximative)")).toHaveValue("12");

  // Back to step 1 via the numbered progress bar — state persisted.
  await page.getByRole("link", { name: "Revenir à l’étape 1 — Dossier" }).click();
  await expect(page.getByText("Étape 1 sur 4 · 2 minutes")).toBeVisible();
  await expect(page.getByLabel("Prénom")).toHaveValue("Camille");

  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await expect(page.getByLabel("Date du sinistre déclaré à votre assureur")).toHaveValue(
    "2026-06-14",
  );

  // Étape 3 — photos. A live photo is required, plus the honour declaration
  // (client, 2026-07-21) before the step can be left.
  await page.getByRole("link", { name: "Continuer vers les photos" }).click();
  await expect(page.getByRole("heading", { name: "Ajoutez vos photos" })).toBeVisible();
  await page.setInputFiles('input[type="file"]', {
    name: "degat.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_JPEG,
  });
  await expect(page.getByText("1 photo ajoutée")).toBeVisible();
  await page.getByRole("checkbox", { name: /Je déclare sur l.honneur/ }).click();
  await shot(page, "funnel-etape-3");

  // Étape 4 — récapitulatif. The étape-2 answers carry through, m² and all.
  await page.getByRole("link", { name: "Continuer vers le paiement" }).click();
  await expect(page.getByRole("heading", { name: "Vérifiez et payez" })).toBeVisible();
  await expect(page.getByText("82,90 € TTC")).toBeVisible();
  await expect(page.getByText("14/06/2026")).toBeVisible();
  await expect(page.getByText(/Salle de bain \(plafond ≈ 12 m²\)/)).toBeVisible();
  await shot(page, "funnel-etape-4");

  // Vente à distance: the pay button stays blocked until both express consents
  // — CGV and renonciation au droit de rétractation — are given.
  const payButton = page.getByRole("button", { name: "Payer 82,90 € et envoyer mon dossier" });
  await expect(payButton).toBeDisabled();
  await page.getByRole("checkbox", { name: /J’accepte les Conditions Générales de Vente/ }).click();
  await expect(payButton).toBeDisabled();
  await page.getByRole("checkbox", { name: /je renonce expressément à mon droit/ }).click();
  await expect(payButton).toBeEnabled();
  await payButton.click();

  // No STRIPE_SECRET_KEY in e2e ⇒ the demo checkout stands in for Stripe. It
  // charges nothing and forwards to /confirmation with a demo session id.
  await expect(page.getByText(/Mode démonstration/)).toBeVisible();
  await page.getByRole("link", { name: "Payer 82,90 € (simulation)" }).click();

  await expect(
    page.getByRole("heading", { name: /Merci Camille, votre dossier est envoyé/ }),
  ).toBeVisible();
  const reference = (await page.getByText(/^AC-2026-\d{4}$/).innerText()).trim();
  await shot(page, "funnel-confirmation");

  // Spec 006 — the dossier is persisted at checkout and marked paid on
  // confirmation, so it must now be a REAL row in the back-office.
  await page.goto("/admin/connexion");
  await page.getByLabel("Mot de passe").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Dossiers reçus" })).toBeVisible();

  await page.getByLabel("Rechercher par nom ou référence").fill(reference);
  const row = page.getByRole("link", { name: new RegExp(reference) });
  await expect(row).toBeVisible();
  await expect(page.getByText("Payé ✓")).toBeVisible();
  await shot(page, "admin-dossier-reel");

  // « Devis envoyé » persists — it used to be local state that forgot on reload.
  await row.click();
  await expect(page.getByRole("heading", { name: reference })).toBeVisible();
  await page.getByRole("radio", { name: "Devis envoyé" }).click();
  // The pills are disabled while the server action is in flight; waiting for
  // them to come back is the deterministic « saved » signal. Reloading straight
  // away would race the round-trip (instant in simulation, not against a real DB).
  await expect(page.getByRole("radio", { name: "Devis envoyé" })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Devis envoyé" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await shot(page, "admin-devis-envoye");
});

import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// CUJ-02 — Start and submit a dossier (specs/003-funnel-devis/spec.md)
test("@cuj CUJ-02: visitor fills the funnel and reaches confirmation", async ({ page }) => {
  await page.goto("/dossier");
  await expect(page.getByRole("heading", { name: "Créons votre dossier" })).toBeVisible();
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel("E-mail").fill("camille.moreau@gmail.com");
  await page.getByRole("radio", { name: "Immeuble en copropriété" }).click();
  await expect(page.getByText("Nom, adresse et téléphone du syndic")).toBeVisible();
  await shot(page, "funnel-etape-1");

  // Étape 2 — « Ultra-Light » (spec 003, R2R 2026-07-16): date, pièces, and a
  // per-pièce block that only exists once that pièce is selected (AC-3).
  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await expect(page.getByRole("heading", { name: "Décrivez votre dégât des eaux" })).toBeVisible();
  await page.getByLabel("Date du sinistre (approximative)").fill("2026-06-14");
  await expect(page.getByText("Que faut-il refaire ?")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByText("Que faut-il refaire ?")).toBeVisible();
  await page.getByRole("checkbox", { name: "Le plafond" }).click();
  await page.getByRole("radio", { name: "Moyenne (10 à 20 m²)" }).click();
  await shot(page, "funnel-etape-2");

  // Deselecting the pièce takes its block away with it (AC-3)
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByText("Que faut-il refaire ?")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();

  // Back to step 1 via the numbered progress bar — state persisted (AC-2)
  await page.getByRole("link", { name: "Revenir à l’étape 1 — Dossier" }).click();
  await expect(page.getByText("Étape 1 sur 4 · 2 minutes")).toBeVisible();
  await expect(page.getByLabel("Prénom")).toHaveValue("Camille");

  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await expect(page.getByLabel("Date du sinistre (approximative)")).toHaveValue("2026-06-14");
  await page.getByRole("link", { name: "Continuer vers les photos" }).click();
  await expect(page.getByRole("heading", { name: "Ajoutez vos photos" })).toBeVisible();
  await shot(page, "funnel-etape-3");

  await page.getByRole("link", { name: "Continuer vers le paiement" }).click();
  await expect(page.getByRole("heading", { name: "Vérifiez et payez" })).toBeVisible();
  await expect(page.getByText("82,90 € TTC")).toBeVisible();
  // The recap carries the étape-2 answers through (AC-5)
  await expect(page.getByText("14/06/2026")).toBeVisible();
  await expect(page.getByText(/Salle de bain \(plafond · moyenne\)/)).toBeVisible();
  await shot(page, "funnel-etape-4");

  // Vente à distance: the pay button stays blocked until both express
  // consents — CGV and renonciation au droit de rétractation — are given.
  const payButton = page.getByRole("button", { name: "Payer 82,90 € et envoyer mon dossier" });
  await expect(payButton).toBeDisabled();
  await page.getByRole("checkbox", { name: /J’accepte les Conditions Générales de Vente/ }).click();
  await expect(payButton).toBeDisabled();
  await page.getByRole("checkbox", { name: /je renonce expressément à mon droit/ }).click();
  await expect(payButton).toBeEnabled();
  await payButton.click();
  await expect(
    page.getByRole("heading", { name: /Merci Camille, votre dossier est envoyé/ }),
  ).toBeVisible();
  await expect(page.getByText(/^AC-2026-\d{4}$/)).toBeVisible();
  await shot(page, "funnel-confirmation");
});

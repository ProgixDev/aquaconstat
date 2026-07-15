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

  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await expect(page.getByRole("heading", { name: "Décrivez votre dégât des eaux" })).toBeVisible();
  await page.getByRole("checkbox", { name: /fuite sur canalisation/i }).click();
  await expect(page.getByText("Accessible", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Salle de bain" }).click();
  await expect(page.getByText("Longueur")).toBeVisible();
  await shot(page, "funnel-etape-2");

  // Back to step 1 — state persisted (AC-2)
  await page.getByRole("link", { name: "Dossier ✓" }).click();
  await expect(page.getByLabel("Prénom")).toHaveValue("Camille");

  await page.getByRole("link", { name: "Continuer vers le questionnaire" }).click();
  await page.getByRole("link", { name: "Continuer vers les photos" }).click();
  await expect(page.getByRole("heading", { name: "Ajoutez vos photos" })).toBeVisible();
  await shot(page, "funnel-etape-3");

  await page.getByRole("link", { name: "Continuer vers le paiement" }).click();
  await expect(page.getByRole("heading", { name: "Vérifiez et payez" })).toBeVisible();
  await expect(page.getByText("149 € TTC")).toBeVisible();
  await shot(page, "funnel-etape-4");

  await page.getByRole("button", { name: "Payer 149 € et envoyer mon dossier" }).click();
  await expect(
    page.getByRole("heading", { name: /Merci Camille, votre dossier est envoyé/ }),
  ).toBeVisible();
  await expect(page.getByText(/^AC-2026-\d{4}$/)).toBeVisible();
  await shot(page, "funnel-confirmation");
});

import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// CUJ-01 — Land, understand, start a dossier (specs/002-landing-accueil/spec.md)
test("@cuj CUJ-01: visitor lands, understands, starts a dossier", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /votre assurance vous demande un devis \? recevez-le en 48 h/i,
    }),
  ).toBeVisible();
  // « Éco-responsable » band (client copy, 2026-07-16)
  await expect(
    page.getByRole("heading", { name: /0 kilomètre parcouru, 100 % d’efficacité/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions fréquentes" })).toBeVisible();
  await shot(page, "home-landing");

  // « Qui sommes-nous ? » — the nav tab and its section (client, 2026-07-22).
  await page
    .getByRole("link", { name: /Qui sommes-nous/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: /Trente ans de métier/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notre engagement" })).toBeVisible();
  await expect(page.getByText(/Chiffrage d’expert accepté par les assurances/)).toBeVisible();
  await shot(page, "home-qui-sommes-nous");
  await page.getByRole("heading", { name: /0 kilomètre parcouru/ }).scrollIntoViewIfNeeded();
  await shot(page, "home-eco");

  await page.getByRole("link", { name: "Démarrer mon dossier" }).first().click();
  await expect(page).toHaveURL(/\/dossier/);
  await expect(page.getByRole("heading", { name: "Créons votre dossier" })).toBeVisible();
});

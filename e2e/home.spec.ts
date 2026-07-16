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
  await expect(page.getByRole("heading", { name: "Questions fréquentes" })).toBeVisible();
  await shot(page, "home-landing");

  await page.getByRole("link", { name: "Démarrer mon dossier" }).first().click();
  await expect(page).toHaveURL(/\/dossier/);
  await expect(page.getByRole("heading", { name: "Créons votre dossier" })).toBeVisible();
});

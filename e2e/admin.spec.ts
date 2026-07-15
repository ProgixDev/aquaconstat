import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// CUJ-03 — Admin reviews a dossier (specs/004-admin/spec.md)
test("@cuj CUJ-03: admin signs in, filters dossiers, opens a detail", async ({ page }) => {
  await page.goto("/admin/connexion");
  await expect(page.getByRole("heading", { name: "Espace administration" })).toBeVisible();

  // Empty submit shows the error card (AC-5)
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Identifiants incorrects.")).toBeVisible();
  await shot(page, "admin-connexion");

  await page.getByLabel("E-mail").fill("pro@aquaconstat.fr");
  await page.getByLabel("Mot de passe").fill("motdepasse");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Dossiers reçus" })).toBeVisible();

  // Search + filter (AC-2)
  await page.getByLabel("Rechercher par nom ou référence").fill("camille");
  await expect(page.getByText("1 dossier · cliquez sur une ligne")).toBeVisible();
  await page.getByLabel("Rechercher par nom ou référence").fill("zzz");
  await expect(page.getByText("Aucun résultat pour « zzz ».")).toBeVisible();
  await page.getByRole("button", { name: "Effacer la recherche" }).click();
  await expect(page.getByText("9 dossiers · cliquez sur une ligne")).toBeVisible();
  await shot(page, "admin-dossiers");

  await page.getByRole("link", { name: /AC-2026-0147/ }).click();
  await expect(page.getByRole("heading", { name: "AC-2026-0147" })).toBeVisible();
  await expect(page.getByText("Réponses au questionnaire")).toBeVisible();

  // Lightbox opens and closes (AC-3)
  await page.getByRole("button", { name: "vue générale — salle de bain" }).click();
  await expect(page.getByText("cliquez n’importe où pour fermer")).toBeVisible();
  await shot(page, "admin-dossier-detail");
  await page.getByText("cliquez n’importe où pour fermer").click();
  await expect(page.getByText("cliquez n’importe où pour fermer")).not.toBeVisible();
});

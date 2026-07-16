import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// Spec 005 — the three legal documents the footer (and the paiement CGV
// checkbox) point at. Content assertions pin the facts that must not drift:
// the contractual price and the two consent mentions quoted by article 5.
test("legal pages render their documents and cross-link (spec 005)", async ({ page }) => {
  await page.goto("/mentions-legales");
  await expect(page.getByRole("heading", { name: "Mentions légales" })).toBeVisible();
  await expect(page.getByText("BEERI CAPITAL").first()).toBeVisible();
  await expect(page.getByText("999 817 174 R.C.S. Créteil")).toBeVisible();
  await expect(page.getByText("SAS BATITEC")).toBeVisible();
  await shot(page, "legal-mentions");

  // Footer cross-link → confidentialité (AC-4)
  await page.getByRole("link", { name: "Politique de confidentialité" }).click();
  await expect(page.getByRole("heading", { name: "Politique de confidentialité" })).toBeVisible();
  await expect(page.getByText("trois (3) ans")).toBeVisible();
  await shot(page, "legal-confidentialite");

  // Footer cross-link → CGV; the contractual price must match the site (AC-3)
  await page.getByRole("link", { name: "CGV", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Conditions Générales de Vente" })).toBeVisible();
  await expect(page.getByText("82,90 € TTC").first()).toBeVisible();
  await expect(
    page.getByText(/Je demande l’exécution immédiate de la prestation et je renonce/).first(),
  ).toBeVisible();
  await shot(page, "legal-cgv");

  // Back to the funnel entry point — a legal page is never a dead end (AC-5)
  await page.getByRole("link", { name: "Retour à l’accueil" }).click();
  await expect(page).toHaveURL("/");
});

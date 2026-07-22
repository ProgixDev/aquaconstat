import { expect, test } from "@playwright/test";
import { shot } from "./utils/shot";

// Supplied by playwright.config.ts (from .env.local, or throwaway test values).
const PASSWORD = process.env.ADMIN_PASSWORD!;

test.describe("admin gate", () => {
  test("refuses an unauthenticated visitor and does not leak dossiers", async ({ page }) => {
    // Straight to the list, no login: this used to render the whole thing.
    await page.goto("/admin/dossiers");
    await expect(page).toHaveURL(/\/admin\/connexion/);
    await expect(page.getByRole("heading", { name: "Espace administration" })).toBeVisible();
    await expect(page.getByText("Nadia Belkacem")).toHaveCount(0);
  });

  test("a forged session cookie does not get past the data layer", async ({ page, context }) => {
    // The middleware only checks that the cookie EXISTS, so this sails past it.
    // What must stop it is the HMAC check in front of the data.
    await context.addCookies([
      {
        name: "ac_admin",
        value: "v1.99999999999999.aaaaaaaaaaaaaaaaaaaaaa.forged",
        path: "/admin",
        domain: "localhost",
      },
    ]);
    await page.goto("/admin/dossiers");
    await expect(page).toHaveURL(/\/admin\/connexion/);
    await expect(page.getByText("Nadia Belkacem")).toHaveCount(0);
  });

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel("Mot de passe").fill("pas-le-bon-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });
});

// CUJ-03 — Admin reviews a dossier (specs/004-admin/spec.md)
test("@cuj CUJ-03: admin signs in, triages by urgency, opens a detail", async ({ page }) => {
  await page.goto("/admin/connexion");
  await expect(page.getByRole("heading", { name: "Espace administration" })).toBeVisible();

  // Empty submit reaches the server and comes back with the same generic error
  // as a wrong password (AC-5).
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Mot de passe incorrect.")).toBeVisible();
  await shot(page, "admin-connexion");

  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Dossiers reçus" })).toBeVisible();

  // The cockpit leads with the SLA (AC-7). By role: « En retard » is both a
  // tile label and a filter button, so plain text is ambiguous.
  await expect(page.getByRole("term").filter({ hasText: "En retard" })).toBeVisible();
  await expect(page.getByRole("term").filter({ hasText: "À rendre aujourd’hui" })).toBeVisible();
  await expect(page.getByRole("button", { name: "En retard" })).toBeVisible();

  // Search + empty state (AC-2). Asserted against BEHAVIOUR, not fixture rows:
  // the list is backed by the real dossier store, so which dossiers exist
  // depends on whether Supabase is configured and what the funnel has created.
  await page.getByLabel("Rechercher par nom ou référence").fill("zzz");
  await expect(page.getByText("Aucun résultat pour « zzz ».")).toBeVisible();
  await page.getByRole("button", { name: "Effacer la recherche" }).click();
  await expect(page.getByText(/\d+ dossiers? · cliquez sur une ligne/)).toBeVisible();
  await shot(page, "admin-dossiers");

  // Open whichever dossier is first — the detail must render for any of them.
  await page
    .getByRole("link", { name: /AC-\d{4}-\d{4}/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: /AC-\d{4}-\d{4}/ })).toBeVisible();
  await expect(page.getByText("Réponses au questionnaire")).toBeVisible();

  // Lightbox opens and closes (AC-3) — first photo, whatever it is called.
  await page
    .getByRole("button", { name: /^Agrandir — / })
    .first()
    .click();
  await expect(page.getByText("cliquez n’importe où pour fermer")).toBeVisible();
  await shot(page, "admin-dossier-detail");
  await page.getByText("cliquez n’importe où pour fermer").click();
  await expect(page.getByText("cliquez n’importe où pour fermer")).not.toBeVisible();

  // Signing out must actually clear the session, not just navigate (AC-6).
  await page.getByRole("link", { name: "← Dossiers reçus" }).click();
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/admin\/connexion/);
  await page.goto("/admin/dossiers");
  await expect(page).toHaveURL(/\/admin\/connexion/);
});

import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3000/dossier/questionnaire", {
  waitUntil: "networkidle",
  timeout: 90000,
});
await p.waitForTimeout(800);
// Select a room to reveal its sub-panel and type a surface
await p.click("text=Salle de bain");
await p.waitForTimeout(400);
await p.click("text=Le plafond");
await p.fill('input[placeholder="12"]', "14,5");
await p.waitForTimeout(400);
const panel = p.locator("text=Surface au sol ou au plafond").first();
await panel.scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
await p.screenshot({ path: "C:/Users/merie/AppData/Local/Temp/questionnaire-m2.png" });
await b.close();
console.log("done");

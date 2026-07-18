import { chromium } from "@playwright/test";
const out = "C:/Users/merie/AppData/Local/Temp/";
const b = await chromium.launch();
// Mobile menu open
const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await m.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 90000 });
await m.click('button[aria-controls="mobile-nav"]');
await m.waitForTimeout(600);
await m.screenshot({
  path: out + "slogan-menu.png",
  clip: { x: 0, y: 0, width: 390, height: 460 },
});
// Desktop header (slogan removed) + final CTA
const d = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await d.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 90000 });
await d.waitForTimeout(800);
await d.screenshot({
  path: out + "slogan-header.png",
  clip: { x: 0, y: 0, width: 1280, height: 120 },
});
await d.evaluate(() => [...document.querySelectorAll("section")].pop().scrollIntoView());
await d.waitForTimeout(1000);
const cta = await d.evaluate(() => {
  const els = [...document.querySelectorAll("p")];
  const el = els.find((p) => p.textContent.includes("Du sinistre à la solution"));
  const r = el.closest("section").getBoundingClientRect();
  return { y: r.top, h: r.height };
});
await d.screenshot({
  path: out + "slogan-cta.png",
  clip: { x: 0, y: Math.max(0, cta.y), width: 1280, height: Math.min(900, cta.h) },
});
await b.close();
console.log("done");

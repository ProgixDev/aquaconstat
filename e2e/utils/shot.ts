import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

/**
 * Screenshot evidence helper (docs/conventions/testing.md).
 * FEATURE=<slug> routes shots to artifacts/screenshots/<slug>/ — that's how
 * /verify-ui and /feature-report find a feature's evidence. Defaults to "baseline".
 * Names must be stable across runs so shots can be diffed release over release.
 */
const dir = join("artifacts", "screenshots", process.env.FEATURE ?? "baseline");

export async function shot(page: Page, name: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
  // Sweep the page first so viewport-triggered animations (scroll reveals)
  // fire before the full-page capture — otherwise below-fold content is
  // photographed in its hidden initial state.
  await page.evaluate(async () => {
    // behavior: "instant" — the site's global scroll-behavior: smooth would
    // otherwise glide between steps and never actually reach the sections.
    const step = window.innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(dir, `${name}.png`),
    fullPage: true,
    animations: "disabled",
  });
}

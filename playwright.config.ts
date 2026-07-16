import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E + screenshot evidence config.
 * - Locally: reuses your `pnpm dev` server (or starts one).
 * - CI: expects a production build (`pnpm build`) and starts `pnpm start`.
 * Screenshots are written by e2e/utils/shot.ts into artifacts/screenshots/.
 */

/**
 * Next loads .env.local for the app, but this process is not Next — and the
 * admin CUJ has to type the password. Read it here so a reused `pnpm dev`
 * server and the specs agree on the same secret. Minimal on purpose: @next/env
 * is not resolvable standalone and dotenv is not a dependency.
 */
function fromEnvLocal(key: string): string | undefined {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match?.[1] === key) return match[2]?.replace(/^["']|["']$/g, "") || undefined;
    }
  } catch {
    // No .env.local — fall through to the throwaway test credentials below.
  }
  return undefined;
}

/**
 * Throwaway credentials so a fresh clone can run the suite green with no setup.
 * These are NOT a backdoor: they only ever enter the environment of a dev
 * server that Playwright itself spawns. Nothing reads them in production, where
 * an unset ADMIN_PASSWORD means the admin area refuses every login.
 * A real .env.local always wins.
 */
const adminPassword =
  process.env.ADMIN_PASSWORD ?? fromEnvLocal("ADMIN_PASSWORD") ?? "e2e-admin-password";
const adminSessionSecret =
  process.env.ADMIN_SESSION_SECRET ??
  fromEnvLocal("ADMIN_SESSION_SECRET") ??
  "e2e-session-secret-not-used-outside-tests";

// Expose to the specs (they run in this process's workers).
process.env.ADMIN_PASSWORD = adminPassword;
process.env.ADMIN_SESSION_SECRET = adminSessionSecret;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Values already in the environment win over .env.local in Next's loader,
    // so a server Playwright starts always matches what the specs type.
    env: { ADMIN_PASSWORD: adminPassword, ADMIN_SESSION_SECRET: adminSessionSecret },
  },
});

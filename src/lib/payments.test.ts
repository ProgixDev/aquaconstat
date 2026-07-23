import { describe, expect, it, vi } from "vitest";

// `server-only` throws outside an RSC server bundle; neutralise it so the
// server module can be unit-tested in the node test env.
vi.mock("server-only", () => ({}));

import { createCheckout, demoSessionId, getCheckout } from "./payments";

// No STRIPE_SECRET_KEY in the test env ⇒ simulation mode. These lock in the
// security property that matters: in simulation only a well-formed demo token
// counts as paid, and nothing else does.

describe("payments — simulation mode", () => {
  it("createCheckout points at the local demo checkout", async () => {
    const { url } = await createCheckout({ reference: "AC-2026-1234", customerEmail: "a@b.com" });
    expect(url).toContain("/dossier/paiement/demo?s=");
  });

  it("reads a well-formed demo session back as paid, with its reference + e-mail", async () => {
    const id = demoSessionId({ reference: "AC-2026-1234", customerEmail: "a@b.com" });
    expect(await getCheckout(id)).toEqual({
      paid: true,
      reference: "AC-2026-1234",
      email: "a@b.com",
    });
  });

  it("treats a non-demo session id as unpaid — no e-mail is ever triggered", async () => {
    expect(await getCheckout("cs_test_forged")).toEqual({ paid: false, reference: "", email: "" });
  });

  it("treats a corrupt demo token as unpaid", async () => {
    expect((await getCheckout("demo_%%%not-json%%%")).paid).toBe(false);
  });
});

// Regression for the P0 found in review (2026-07-23): with Stripe unconfigured
// but Supabase configured — exactly how the first production deploy looked — the
// demo checkout stamped `paid_at` on REAL rows. The 82,90 € product, free.
describe("payments — production without Stripe must fail closed", () => {
  async function loadPayments(envOverrides: Record<string, unknown>) {
    vi.resetModules();
    vi.doMock("@/core/env", () => ({ env: envOverrides }));
    vi.doMock("@/core/env.client", () => ({
      clientEnv: { NEXT_PUBLIC_SITE_URL: "https://example.com" },
    }));
    return import("./payments");
  }

  const input = { reference: "AC-2026-1234", customerEmail: "a@b.com" };

  it("refuses to open a demo checkout in production", async () => {
    const { createCheckout, isSimulationAllowed } = await loadPayments({
      NODE_ENV: "production",
    });
    expect(isSimulationAllowed).toBe(false);
    await expect(createCheckout(input)).rejects.toThrow(/not configured/i);
  });

  it("never reads a demo token back as paid in production", async () => {
    const { getCheckout, demoSessionId } = await loadPayments({ NODE_ENV: "production" });
    // Even a perfectly well-formed token — the exact forgery an attacker builds.
    expect(await getCheckout(demoSessionId(input))).toEqual({
      paid: false,
      reference: "",
      email: "",
    });
  });

  it("still allows simulation in production when deliberately opted in", async () => {
    const { getCheckout, demoSessionId } = await loadPayments({
      NODE_ENV: "production",
      ALLOW_DEMO_CHECKOUT: "1",
    });
    expect((await getCheckout(demoSessionId(input))).paid).toBe(true);
  });
});

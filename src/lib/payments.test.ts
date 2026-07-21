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

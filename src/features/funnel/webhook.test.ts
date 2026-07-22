import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const markPaid = vi.fn();
const fetchDossierPhotos = vi.fn(async () => []);
vi.mock("@/lib/dossiers", () => ({
  dossierStore: { markPaid },
  fetchDossierPhotos,
}));

const sendEmail = vi.fn<(message: { to: string }) => Promise<{ delivered: boolean }>>(async () => ({
  delivered: true,
}));
vi.mock("@/lib/email", () => ({
  sendEmail,
  operatorAddress: "operateur@test.fr",
  isEmailLive: false,
}));

const constructEvent = vi.fn();
vi.mock("stripe", () => ({
  default: class {
    webhooks = { constructEvent };
  },
}));

// The handler reads its secrets at call time from `env`, so each case loads the
// module with the env it needs.
async function loadWebhook(envOverrides: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("@/core/env", () => ({ env: envOverrides }));
  return import("./webhook");
}

const CONFIGURED = { STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" };

const paidEvent = {
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_1",
      payment_status: "paid",
      customer_email: "camille@example.com",
      metadata: { reference: "AC-2026-1234" },
    },
  },
};

const dossier = {
  reference: "AC-2026-1234",
  email: "camille@example.com",
  photos: [],
  data: {
    assuranceReclame: true,
    prenom: "Camille",
    nom: "Moreau",
    email: "camille@example.com",
    telephone: "",
    adresse: "12 rue des Lilas",
    batiment: "",
    etage: "",
    codePostal: "75011",
    ville: "Paris",
    typeLieu: "copro",
    syndic: "",
    statut: "locataire",
    dateSinistre: "2026-07-10",
    pieces: { sdb: true },
    surfaces: { sdb: { parts: { plaf: "12" } } },
    photosAttestation: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleStripeWebhook", () => {
  it("fails closed when no webhook secret is configured (AC-9)", async () => {
    const { handleStripeWebhook } = await loadWebhook({});
    const res = await handleStripeWebhook("{}", "sig");
    expect(res.status).toBe(503);
    expect(markPaid).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing signature", async () => {
    const { handleStripeWebhook } = await loadWebhook(CONFIGURED);
    expect((await handleStripeWebhook("{}", null)).status).toBe(400);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it("rejects a FORGED signature — nothing is paid, nothing is e-mailed (AC-4)", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { handleStripeWebhook } = await loadWebhook(CONFIGURED);
    const res = await handleStripeWebhook(JSON.stringify(paidEvent), "forged");
    expect(res.status).toBe(400);
    expect(markPaid).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("marks the dossier paid and sends both e-mails on a signed event (AC-3, AC-5)", async () => {
    constructEvent.mockReturnValue(paidEvent);
    markPaid.mockResolvedValue(dossier);
    const { handleStripeWebhook } = await loadWebhook(CONFIGURED);
    const res = await handleStripeWebhook(JSON.stringify(paidEvent), "sig");
    expect(res.status).toBe(200);
    expect(markPaid).toHaveBeenCalledWith({ reference: "AC-2026-1234" }, expect.any(String));
    const recipients = sendEmail.mock.calls.map(([message]) => message.to);
    expect(recipients).toEqual(["operateur@test.fr", "camille@example.com"]);
  });

  it("is idempotent — a retried delivery re-sends nothing (AC-4)", async () => {
    constructEvent.mockReturnValue(paidEvent);
    markPaid.mockResolvedValue(null); // already paid
    const { handleStripeWebhook } = await loadWebhook(CONFIGURED);
    const res = await handleStripeWebhook(JSON.stringify(paidEvent), "sig");
    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("ignores an unpaid session and other event types", async () => {
    const { handleStripeWebhook } = await loadWebhook(CONFIGURED);

    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { ...paidEvent.data.object, payment_status: "unpaid" } },
    });
    expect((await handleStripeWebhook("{}", "sig")).status).toBe(200);

    constructEvent.mockReturnValue({ type: "payment_intent.created", data: { object: {} } });
    expect((await handleStripeWebhook("{}", "sig")).status).toBe(200);

    expect(markPaid).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Collaborators are stubbed: these tests are about startCheckout's own logic —
// unique-reference minting, retry reuse, and refusing to drop a photo — not the
// store or Stripe. Env has no keys ⇒ simulation, which is fine here.
const { create, attachPhotos, get, uploadDossierPhotos, createCheckout } = vi.hoisted(() => ({
  create: vi.fn(),
  attachPhotos: vi.fn(),
  get: vi.fn(),
  uploadDossierPhotos: vi.fn(async (_ref: string, files: unknown[]) =>
    files.map((_, i) => ({ path: `p/${i}`, name: `n${i}`, takenAt: null })),
  ),
  createCheckout: vi.fn(async () => ({ url: "/dossier/paiement/demo?s=x" })),
}));
vi.mock("@/lib/dossiers", () => ({
  dossierStore: { create, attachPhotos, get },
  uploadDossierPhotos,
}));
vi.mock("@/lib/payments", () => ({
  createCheckout,
  getCheckout: vi.fn(),
  isPaymentLive: false,
}));

vi.mock("@/lib/email", () => ({
  isEmailLive: false,
  operatorAddress: "op@test.fr",
  sendEmail: vi.fn(),
}));

import { startCheckout } from "./actions";

const DOSSIER = {
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
};

function form(fields: {
  dossier?: unknown;
  reference?: string;
  photos?: { name: string; bytes: number }[];
}): FormData {
  const fd = new FormData();
  fd.set("dossier", JSON.stringify(fields.dossier ?? DOSSIER));
  if (fields.reference) fd.set("reference", fields.reference);
  if (fields.photos) {
    fd.set(
      "photosMeta",
      JSON.stringify(fields.photos.map((p) => ({ name: p.name, takenAt: null }))),
    );
    for (const p of fields.photos) {
      fd.append(
        "photos",
        new File([new Uint8Array(p.bytes)], p.name, { type: "image/jpeg" }),
        p.name,
      );
    }
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue(undefined);
  attachPhotos.mockResolvedValue(undefined);
});

describe("startCheckout", () => {
  it("persists the dossier once and returns a server-owned AC-YYYY-NNNN reference", async () => {
    const { reference } = await startCheckout(form({ photos: [{ name: "a.jpg", bytes: 100 }] }));
    expect(reference).toMatch(/^AC-\d{4}-\d{4}$/);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![0].reference).toBe(reference);
    // The year is derived, not the literal "2026".
    expect(reference.startsWith(`AC-${new Date().getFullYear()}-`)).toBe(true);
  });

  it("rejects an invalid dossier without creating anything", async () => {
    await expect(startCheckout(form({ dossier: { prenom: "x" } }))).rejects.toThrow(/invalide/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("REUSES the existing dossier on a retry instead of minting a second (AC-4)", async () => {
    get.mockResolvedValue({ reference: "AC-2026-1234", paidAt: null });
    const res = await startCheckout(
      form({ reference: "AC-2026-1234", photos: [{ name: "a.jpg", bytes: 100 }] }),
    );
    expect(res.reference).toBe("AC-2026-1234");
    expect(create).not.toHaveBeenCalled(); // no second row
    expect(createCheckout).toHaveBeenCalledWith({
      reference: "AC-2026-1234",
      customerEmail: "camille@example.com",
    });
  });

  it("mints a new dossier if the carried reference is already paid or gone", async () => {
    get.mockResolvedValue({ reference: "AC-2026-1234", paidAt: "2026-07-10T00:00:00Z" });
    const res = await startCheckout(form({ reference: "AC-2026-1234" }));
    expect(res.reference).not.toBe("AC-2026-1234");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("REFUSES to drop an oversized photo — the customer is not charged (AC-2)", async () => {
    await expect(
      startCheckout(form({ photos: [{ name: "huge.jpg", bytes: 21 * 1024 * 1024 }] })),
    ).rejects.toThrow("photo-too-large");
    expect(create).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("retries the reference on a collision, then gives up after the cap", async () => {
    create.mockRejectedValue(new Error("duplicate reference"));
    await expect(startCheckout(form({}))).rejects.toThrow(/duplicate/);
    expect(create.mock.calls.length).toBeGreaterThan(1); // it retried
  });
});

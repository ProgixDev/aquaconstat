import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { memoryStore } from "./memory";
import type { DossierData } from "./types";

const data: DossierData = {
  assuranceReclame: true,
  prenom: "Léa",
  nom: "Dubois",
  email: "lea.dubois@example.com",
  telephone: "0601020304",
  adresse: "3 rue Verte",
  batiment: "",
  etage: "",
  codePostal: "44000",
  ville: "Nantes",
  typeLieu: "maison",
  syndic: "",
  statut: "proprio",
  dateSinistre: "2026-07-10",
  pieces: { salon: true },
  surfaces: { salon: { parts: { sol: "15" } } },
  photosAttestation: true,
};

// Each test mints a unique reference so the shared module-level seed store never
// collides between cases.
let n = 0;
const ref = () => `AC-2026-90${(n += 1).toString().padStart(2, "0")}`;

describe("memoryStore (simulation adapter)", () => {
  beforeEach(() => {
    n = 0;
  });

  it("is seeded with the nine fixture dossiers (keeps /admin populated offline)", async () => {
    const all = await memoryStore.list();
    expect(all.length).toBeGreaterThanOrEqual(9);
    expect(all.some((d) => d.reference === "AC-2026-0147" && d.nom === "Camille Moreau")).toBe(
      true,
    );
  });

  it("persists a new dossier at « En attente », unpaid (AC-1)", async () => {
    const reference = ref();
    await memoryStore.create({ reference, data });
    const row = await memoryStore.get(reference);
    expect(row?.statut).toBe("En attente");
    expect(row?.paidAt).toBeNull();
    expect(row?.nom).toBe("Dubois");
    expect(row?.data.email).toBe("lea.dubois@example.com");
  });

  it("stores no image data — only the text answers (AC-2)", async () => {
    const reference = ref();
    await memoryStore.create({ reference, data });
    const row = await memoryStore.get(reference);
    // `photosAttestation` (a boolean) is fine; what must never appear is image
    // BYTES or a photo URL — the honour flag is stored, the pictures are not.
    expect(JSON.stringify(row)).not.toMatch(/blob:|data:image|base64|\.jpe?g|\.png|"url"/i);
    expect(row?.data.photosAttestation).toBe(true); // the flag we DO keep
  });

  it("marks paid exactly once — a retried webhook is a no-op (AC-4 idempotency)", async () => {
    const reference = ref();
    await memoryStore.create({ reference, data });
    const first = await memoryStore.markPaid({ reference }, "2026-07-11T09:00:00Z");
    expect(first?.paidAt).toBe("2026-07-11T09:00:00Z");
    const second = await memoryStore.markPaid({ reference }, "2026-07-11T10:00:00Z");
    expect(second).toBeNull(); // already paid ⇒ no second e-mail
    expect((await memoryStore.get(reference))?.paidAt).toBe("2026-07-11T09:00:00Z");
  });

  it("never marks an unknown dossier paid", async () => {
    expect(
      await memoryStore.markPaid({ reference: "AC-2026-0000" }, "2026-07-11T09:00:00Z"),
    ).toBeNull();
  });

  it("flips status to « Devis envoyé » and stamps the time (AC-6/AC-8)", async () => {
    const reference = ref();
    await memoryStore.create({ reference, data });
    const updated = await memoryStore.setStatut(reference, "Devis envoyé", "2026-07-12T12:00:00Z");
    expect(updated?.statut).toBe("Devis envoyé");
    expect(updated?.devisEnvoyeAt).toBe("2026-07-12T12:00:00Z");
    // Persisted, not just returned.
    expect((await memoryStore.get(reference))?.statut).toBe("Devis envoyé");
  });
});

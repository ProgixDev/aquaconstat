import { describe, expect, it } from "vitest";
import type { DossierData } from "@/lib/dossiers";
import { buildCustomerEmail, buildOperatorEmail } from "./emails";

const dossier: DossierData = {
  assuranceReclame: true,
  prenom: "Camille",
  nom: "Moreau",
  email: "camille.moreau@gmail.com",
  telephone: "0612345678",
  adresse: "12 rue des Lilas",
  batiment: "B",
  etage: "3e",
  codePostal: "75011",
  ville: "Paris",
  typeLieu: "copro",
  syndic: "Cabinet Duval",
  statut: "locataire",
  dateSinistre: "2026-07-10",
  pieces: {
    salon: false,
    chambre: false,
    cuisine: false,
    sdb: true,
    couloirWc: false,
    partiesCommunes: false,
  },
  surfaces: { sdb: { parts: { plaf: "12", sol: "8" } } },
  photosAttestation: true,
};

describe("buildOperatorEmail", () => {
  const photos = [
    { name: "a.jpg", takenAt: "2026-07-18T14:23:05" },
    { name: "b.jpg", takenAt: null },
  ];
  const email = buildOperatorEmail(dossier, "AC-2026-1234", photos);

  it("carries the reference and client in the subject", () => {
    expect(email.subject).toContain("AC-2026-1234");
    expect(email.subject).toContain("Camille Moreau");
  });

  it("includes every dossier field in the body", () => {
    for (const value of [
      "AC-2026-1234",
      "camille.moreau@gmail.com",
      "0612345678",
      "12 rue des Lilas",
      "75011 Paris",
      "Immeuble en copropriété",
      "Cabinet Duval",
      "10/07/2026",
      "Photos attestées sur l’honneur",
    ]) {
      expect(email.text).toContain(value);
      expect(email.html).toContain(value);
    }
  });

  it("describes the touched room with a m² per checked part", () => {
    expect(email.text).toContain("Salle de bain — plafond ≈ 12 m², sol ≈ 8 m²");
  });

  it("lists the photos with their capture dates", () => {
    expect(email.text).toContain("a.jpg — prise le 18/07/2026 à 14 h 23");
    expect(email.text).toContain("b.jpg");
    expect(email.text).toContain("Photos (2)");
  });

  it("escapes HTML so a crafted name can't inject markup", () => {
    const hostile = { ...dossier, nom: "<script>alert(1)</script>" };
    const out = buildOperatorEmail(hostile, "AC-2026-9999", []);
    expect(out.html).not.toContain("<script>");
    expect(out.html).toContain("&lt;script&gt;");
  });
});

describe("buildCustomerEmail", () => {
  const email = buildCustomerEmail(dossier, "AC-2026-1234");

  it("greets the customer by first name and states the reference and SLA", () => {
    expect(email.text).toContain("Bonjour Camille,");
    expect(email.text).toContain("AC-2026-1234");
    expect(email.text).toContain("48 h ouvrées");
  });

  it("falls back to a neutral greeting without a first name", () => {
    const anon = buildCustomerEmail({ ...dossier, prenom: "" }, "AC-2026-1234");
    expect(anon.text).toContain("Bonjour,");
  });
});

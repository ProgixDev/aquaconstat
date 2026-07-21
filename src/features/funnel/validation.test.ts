import { describe, expect, it } from "vitest";
import type { FunnelData } from "./types";
import {
  formatMissing,
  missingForDossier,
  missingForPayment,
  missingForPhotos,
  missingForQuestionnaire,
} from "./validation";

const empty: FunnelData = {
  assuranceReclame: true,
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  adresse: "",
  batiment: "",
  etage: "",
  codePostal: "",
  ville: "",
  typeLieu: "",
  syndic: "",
  statut: "",
  dateSinistre: "",
  pieces: {
    salon: false,
    chambre: false,
    cuisine: false,
    sdb: false,
    couloirWc: false,
    partiesCommunes: false,
  },
  surfaces: {},
  photosAttestation: false,
};

const filled: FunnelData = {
  ...empty,
  prenom: "Camille",
  nom: "Moreau",
  email: "camille.moreau@gmail.com",
  adresse: "12 rue des Lilas",
  codePostal: "75011",
  ville: "Paris",
  typeLieu: "copro",
  statut: "locataire",
  dateSinistre: "2026-07-10",
  pieces: { ...empty.pieces, sdb: true },
  surfaces: { sdb: { parts: { plaf: "12" } } },
  photosAttestation: true,
};

describe("missingForDossier", () => {
  it("lists every missing coordinate on an empty form", () => {
    expect(missingForDossier(empty)).toContain("votre prénom");
    expect(missingForDossier(empty)).toContain("un e-mail valide");
    expect(missingForDossier(empty)).toContain("votre statut");
  });

  it("rejects a malformed e-mail", () => {
    expect(missingForDossier({ ...filled, email: "camille.moreau" })).toEqual(["un e-mail valide"]);
  });

  it("passes a complete étape 1", () => {
    expect(missingForDossier(filled)).toEqual([]);
  });
});

describe("missingForQuestionnaire", () => {
  it("requires a date and at least one room", () => {
    expect(missingForQuestionnaire(empty)).toEqual([
      "la date du sinistre",
      "au moins une pièce touchée",
    ]);
  });

  it("rejects a room with nothing to redo — it prices nothing", () => {
    const noWork: FunnelData = {
      ...filled,
      surfaces: { sdb: { parts: {} } },
    };
    expect(missingForQuestionnaire(noWork)).toEqual([
      "ce qu’il faut refaire dans chaque pièce cochée",
    ]);
  });

  it("passes a complete étape 2", () => {
    expect(missingForQuestionnaire(filled)).toEqual([]);
  });
});

describe("missingForPhotos", () => {
  it("requires at least one usable photo", () => {
    expect(missingForPhotos(0, true)).toEqual(["au moins 1 photo du sinistre"]);
    expect(missingForPhotos(1, true)).toEqual([]);
  });

  it("requires the honour declaration (client, 2026-07-21)", () => {
    expect(missingForPhotos(1, false)).toEqual(["votre déclaration sur l’honneur"]);
    expect(missingForPhotos(0, false)).toEqual([
      "au moins 1 photo du sinistre",
      "votre déclaration sur l’honneur",
    ]);
  });
});

describe("missingForPayment", () => {
  it("blocks an empty dossier from ever being charged", () => {
    expect(missingForPayment(empty, 0).length).toBeGreaterThan(0);
  });

  it("blocks a dossier complete on paper but without a photo", () => {
    expect(missingForPayment(filled, 0)).toEqual(["au moins 1 photo du sinistre"]);
  });

  it("lets a genuinely complete dossier through", () => {
    expect(missingForPayment(filled, 2)).toEqual([]);
  });
});

describe("formatMissing", () => {
  it("punctuates the list the French way", () => {
    expect(formatMissing([])).toBe("");
    expect(formatMissing(["le code postal"])).toBe("le code postal");
    expect(formatMissing(["le nom", "la ville"])).toBe("le nom et la ville");
    expect(formatMissing(["le nom", "la ville", "le statut"])).toBe(
      "le nom, la ville et le statut",
    );
  });
});

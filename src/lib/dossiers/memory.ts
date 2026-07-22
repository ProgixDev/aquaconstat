import "server-only";
import type {
  DossierData,
  DossierMatch,
  DossierPhoto,
  DossierRecord,
  DossierStatut,
  DossierStore,
  NewDossier,
} from "./types";

/**
 * In-memory dossier store — the SIMULATION adapter, used whenever
 * `SUPABASE_SERVICE_ROLE_KEY` is absent (see index.ts). It is a module-level
 * Map: fine for dev and the hermetic e2e (one server process), and never the
 * production path. It is seeded with the same nine dossiers the admin used to
 * hard-code, so `/admin` still has content offline, and new submissions append.
 *
 * Deliberately not the SSR-store anti-pattern: this holds shared server data
 * for a dev process, not per-request React state.
 */

// The reference dossier's answers — every seed row reuses it (with its own name
// and city) so any detail opens cleanly, mirroring the old fixture behaviour.
const seedData: DossierData = {
  assuranceReclame: true,
  prenom: "Camille",
  nom: "Moreau",
  email: "camille.moreau@gmail.com",
  telephone: "06 42 17 89 03",
  adresse: "12 rue des Lilas",
  batiment: "B",
  etage: "3e",
  codePostal: "69003",
  ville: "Lyon",
  typeLieu: "copro",
  syndic: "Cabinet Berthelot — 4 quai Saint-Antoine, 69002 Lyon · 04 72 10 22 30",
  statut: "locataire",
  dateSinistre: "2026-06-14",
  pieces: { sdb: true, couloirWc: true },
  surfaces: { sdb: { parts: { plaf: "12", murs: "12" } }, couloirWc: { parts: { murs: "6" } } },
  photosAttestation: true,
};

// Simulation has no bucket, so the seed photos point at the public mock files —
// `signDossierPhotos` passes a path straight through when storage is offline,
// which keeps the admin photo grid and its lightbox working with no cloud.
const seedPhotos: DossierPhoto[] = [
  {
    path: "/mock/dossier/01-vue-generale.jpg",
    name: "vue générale — salle de bain",
    takenAt: null,
  },
  { path: "/mock/dossier/02-plafond.jpg", name: "plafond — salle de bain", takenAt: null },
  {
    path: "/mock/dossier/03-zone-endommagee.jpg",
    name: "zone endommagée — gros plan",
    takenAt: null,
  },
  { path: "/mock/dossier/04-mur-couloir.jpg", name: "mur — couloir", takenAt: null },
  { path: "/mock/dossier/05-reprise.jpg", name: "photo-05 — reprise", takenAt: null },
];

type Seed = {
  reference: string;
  nom: string;
  ville: string;
  createdAt: string;
  paidAt: string | null;
  statut: DossierStatut;
};

// Anchored to the fixture's « today » of 2026-07-16 so the SLA cockpit keeps its
// legible spread (late / due today / on track / blocked / sent).
const seeds: Seed[] = [
  {
    reference: "AC-2026-0152",
    nom: "Nadia Belkacem",
    ville: "Villeurbanne",
    createdAt: "2026-07-14T08:55:00Z",
    paidAt: "2026-07-14T09:12:00Z",
    statut: "En attente",
  },
  {
    reference: "AC-2026-0151",
    nom: "Thomas Lefebvre",
    ville: "Nantes",
    createdAt: "2026-07-13T16:20:00Z",
    paidAt: "2026-07-13T16:40:00Z",
    statut: "En attente",
  },
  {
    reference: "AC-2026-0150",
    nom: "Marie-Claude Perrin",
    ville: "Bordeaux",
    createdAt: "2026-07-11T10:05:00Z",
    paidAt: null,
    statut: "En attente",
  },
  {
    reference: "AC-2026-0149",
    nom: "Julien Roche",
    ville: "Toulouse",
    createdAt: "2026-07-15T10:48:00Z",
    paidAt: "2026-07-15T11:05:00Z",
    statut: "En attente",
  },
  {
    reference: "AC-2026-0148",
    nom: "Sophie Anselme",
    ville: "Rennes",
    createdAt: "2026-07-16T08:05:00Z",
    paidAt: "2026-07-16T08:20:00Z",
    statut: "En attente",
  },
  {
    reference: "AC-2026-0147",
    nom: "Camille Moreau",
    ville: "Lyon",
    createdAt: "2026-07-14T14:10:00Z",
    paidAt: "2026-07-14T14:32:00Z",
    statut: "En attente",
  },
  {
    reference: "AC-2026-0146",
    nom: "Karim Haddad",
    ville: "Marseille",
    createdAt: "2026-07-09T09:30:00Z",
    paidAt: "2026-07-09T09:44:00Z",
    statut: "Devis envoyé",
  },
  {
    reference: "AC-2026-0145",
    nom: "Élise Fontaine",
    ville: "Dijon",
    createdAt: "2026-07-08T15:12:00Z",
    paidAt: "2026-07-08T15:30:00Z",
    statut: "Devis envoyé",
  },
  {
    reference: "AC-2026-0144",
    nom: "Paul Guérin",
    ville: "Angers",
    createdAt: "2026-07-06T11:02:00Z",
    paidAt: "2026-07-06T11:18:00Z",
    statut: "Devis envoyé",
  },
];

function seedRecords(): Map<string, DossierRecord> {
  const map = new Map<string, DossierRecord>();
  for (const s of seeds) {
    map.set(s.reference, {
      reference: s.reference,
      nom: s.nom,
      ville: s.ville,
      email: seedData.email,
      statut: s.statut,
      createdAt: s.createdAt,
      paidAt: s.paidAt,
      devisEnvoyeAt: s.statut === "Devis envoyé" ? s.paidAt : null,
      stripeSessionId: null,
      data: { ...seedData, nom: s.nom, ville: s.ville },
      photos: seedPhotos,
    });
  }
  return map;
}

const store = seedRecords();

export const memoryStore: DossierStore = {
  async create(input: NewDossier) {
    // Mirrors the DB's unique constraint so both adapters behave identically.
    if (store.has(input.reference)) throw new Error(`duplicate reference ${input.reference}`);
    const d = input.data;
    store.set(input.reference, {
      reference: input.reference,
      nom: d.nom,
      ville: d.ville,
      email: d.email,
      statut: "En attente",
      createdAt: new Date().toISOString(),
      paidAt: null,
      devisEnvoyeAt: null,
      stripeSessionId: input.stripeSessionId ?? null,
      data: d,
      photos: input.photos ?? [],
    });
  },

  async attachPhotos(reference: string, photos: DossierPhoto[]) {
    const row = store.get(reference);
    if (row) row.photos = photos;
  },

  async markPaid(match: DossierMatch, paidAtISO: string) {
    const row = find(match);
    if (!row || row.paidAt) return null; // already paid or unknown ⇒ no e-mail
    row.paidAt = paidAtISO;
    return row;
  },

  async list() {
    return [...store.values()];
  },

  async get(reference: string) {
    return store.get(reference) ?? null;
  },

  async setStatut(reference: string, statut: DossierStatut, atISO: string) {
    const row = store.get(reference);
    if (!row) return null;
    row.statut = statut;
    row.devisEnvoyeAt = statut === "Devis envoyé" ? atISO : null;
    return row;
  },
};

function find(match: DossierMatch): DossierRecord | undefined {
  if (match.reference) return store.get(match.reference);
  if (match.sessionId) {
    for (const row of store.values()) {
      if (row.stripeSessionId === match.sessionId) return row;
    }
  }
  return undefined;
}

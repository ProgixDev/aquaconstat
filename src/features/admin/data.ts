/**
 * Admin dossier reads — now backed by the real store (spec 006).
 *
 * `server-only` is load-bearing, not decoration: this module handles dossier
 * PII, and until 2026-07-16 the list was value-imported by a "use client" table,
 * which shipped every record into a public /_next/static chunk. Importing this
 * from a client component is a build error.
 *
 * The exported readers are also the AUTHORIZATION BOUNDARY: they call
 * requireAdminSession() themselves rather than trusting a layout to have done
 * it (see session.ts for why a layout is not a reliable gate).
 *
 * The nine-row fixture that used to live here moved into the store's in-memory
 * adapter, which stands in whenever Supabase is not configured — so this file
 * is the same code path in dev and in production.
 */
import "server-only";
import {
  dossierStore,
  signDossierPhotos,
  type DossierData,
  type DossierRecord,
  type DossierStatut,
} from "@/lib/dossiers";
import { requireAdminSession } from "./session";

export type { DossierStatut };

export type DossierRow = {
  ref: string;
  nom: string;
  ville: string;
  /** ISO 8601. The display string is derived, never stored alongside. */
  createdAt: string;
  /**
   * ISO 8601 when Stripe confirmed payment; null when it has not (yet). The
   * 48 h ouvrées clock starts here — and « is it paid » is read from this, so
   * there is no separate boolean that can contradict it.
   */
  paidAt: string | null;
  statut: DossierStatut;
};

export type DossierDetail = DossierRow & {
  email: string;
  telephone: string;
  adresse: string;
  batiment: string;
  demandeur: string;
  syndic: string;
  sinistre: { label: string; value: string }[];
  /** Per pièce: what to redo + the m² touched on each part. */
  surfaces: { label: string; value: string }[];
  /** Signed, short-lived URLs from the private bucket (or the mock paths in
      simulation) — never a public object URL. */
  photos: { label: string; src: string }[];
};

// Display copy. Duplicated from the funnel on purpose: a feature may never
// import another feature, and this is the admin's own wording.
const typeLieuLabels: Record<string, string> = {
  maison: "Maison particulière",
  copro: "Immeuble en copropriété",
  locatif: "Immeuble locatif",
};

const statutLabels: Record<string, string> = {
  locataire: "Locataire",
  proprio: "Propriétaire / copropriétaire",
  syndic: "Syndic de copropriété",
  gerant: "Gérant de l’immeuble / agence",
};

const pieceOrder = ["salon", "chambre", "cuisine", "sdb", "couloirWc", "partiesCommunes"] as const;
const pieceLabels: Record<string, string> = {
  salon: "Salon",
  chambre: "Chambre",
  cuisine: "Cuisine",
  sdb: "Salle de bain",
  couloirWc: "Couloir/WC",
  partiesCommunes: "Parties communes (Hall, cage d’escalier…)",
};

const partOrder = ["plaf", "murs", "sol"] as const;
const partLabels: Record<string, string> = { plaf: "Plafond", murs: "Murs", sol: "Sol" };

/** « 2026-07-10 » → « 10 juillet 2026 ». */
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
function frDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso || "—";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

function touchedPieces(data: DossierData): string[] {
  return pieceOrder.filter((k) => data.pieces[k]).map((k) => pieceLabels[k]!);
}

function toRow(record: DossierRecord): DossierRow {
  return {
    ref: record.reference,
    nom: record.nom,
    ville: record.ville,
    createdAt: record.createdAt,
    paidAt: record.paidAt,
    statut: record.statut,
  };
}

export type DossiersRead = { dossiers: DossierRow[]; readAt: number };
export type DossierRead = { dossier: DossierDetail | undefined; readAt: number };

/**
 * `readAt` travels with the data rather than being stamped in the page.
 *
 * Every SLA countdown is relative to a clock, so the clock is part of the read,
 * not something a component invents: `Date.now()` during render is impure
 * (react-hooks/purity rightly rejects it) and would also give the server and
 * the client two different answers to hydrate against.
 */
export async function getDossiers(): Promise<DossiersRead> {
  await requireAdminSession();
  const records = await dossierStore.list();
  return { dossiers: records.map(toRow), readAt: Date.now() };
}

/** One dossier, with its photos resolved to signed URLs. Gated like the list. */
export async function getDossier(ref: string): Promise<DossierRead> {
  await requireAdminSession();
  const record = await dossierStore.get(ref);
  if (!record) return { dossier: undefined, readAt: Date.now() };

  const d = record.data;
  const photos = await signDossierPhotos(record.photos);
  const pieces = touchedPieces(d);

  const dossier: DossierDetail = {
    ...toRow(record),
    email: d.email || "—",
    telephone: d.telephone || "—",
    adresse:
      [
        d.adresse,
        d.batiment && `Bât. ${d.batiment}`,
        d.etage && `${d.etage} étage`,
        [d.codePostal, d.ville].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ") || "—",
    batiment: d.typeLieu ? (typeLieuLabels[d.typeLieu] ?? d.typeLieu) : "—",
    demandeur: d.statut ? (statutLabels[d.statut] ?? d.statut) : "—",
    syndic: d.syndic || "—",
    sinistre: [
      { label: "Date du sinistre", value: d.dateSinistre ? frDate(d.dateSinistre) : "—" },
      { label: "Pièces endommagées", value: pieces.length ? pieces.join(" · ") : "—" },
      { label: "Photos attestées sur l’honneur", value: d.photosAttestation ? "Oui" : "Non" },
    ],
    surfaces: pieceOrder
      .filter((k) => d.pieces[k])
      .map((k) => {
        const room = d.surfaces[k];
        const parts = partOrder
          .filter((p) => room && p in room.parts)
          .map((p) => {
            const m2 = room?.parts[p];
            return m2 ? `${partLabels[p]} ≈ ${m2} m²` : partLabels[p]!;
          });
        return { label: pieceLabels[k]!, value: parts.length ? parts.join(", ") : "—" };
      }),
    photos: photos.map((p) => ({ label: p.name, src: p.url })),
  };

  return { dossier, readAt: Date.now() };
}

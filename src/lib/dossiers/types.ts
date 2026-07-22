/**
 * Persisted dossier contract — shared by the funnel (which writes at checkout)
 * and the admin (which reads), so it lives in `lib`, not in either feature
 * (module boundaries forbid feature→feature). It mirrors the funnel's captured
 * answers MINUS the photos: photos are e-mailed only and never stored (RGPD,
 * spec 006). There is deliberately no image field anywhere in this file.
 */

export type DossierStatut = "En attente" | "Devis envoyé";

/** Photo metadata as persisted on the dossier row. The BYTES live in the private
 *  `dossier-photos` bucket — `path` is the object key, never a public URL. */
export type DossierPhoto = { path: string; name: string; takenAt: string | null };

/** A photo with a short-lived signed URL, ready for the admin to render. */
export type ResolvedPhoto = DossierPhoto & { url: string };

/** The funnel answers we persist. Text only — never any image data. */
export type DossierData = {
  assuranceReclame: boolean;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  batiment: string;
  etage: string;
  codePostal: string;
  ville: string;
  typeLieu: string;
  syndic: string;
  statut: string;
  dateSinistre: string;
  pieces: Record<string, boolean>;
  surfaces: Record<string, { parts: Record<string, string> }>;
  photosAttestation: boolean;
};

/** A stored dossier, as the admin reads it. `paidAt` is set only by the Stripe
 *  webhook (or the demo confirm in simulation) — never a browser redirect. */
export type DossierRecord = {
  reference: string;
  nom: string;
  ville: string;
  email: string;
  statut: DossierStatut;
  createdAt: string; // ISO 8601
  paidAt: string | null;
  devisEnvoyeAt: string | null;
  stripeSessionId: string | null;
  data: DossierData;
  /** Object keys in the private bucket — resolve with `signDossierPhotos`. */
  photos: DossierPhoto[];
};

export type NewDossier = {
  reference: string;
  stripeSessionId?: string | null;
  data: DossierData;
  photos?: DossierPhoto[];
};

/** Matches a dossier by reference or Stripe session id (webhook idempotency). */
export type DossierMatch = { reference?: string; sessionId?: string };

export interface DossierStore {
  /** Persist a dossier at « En attente ». THROWS if the reference already
   *  exists — the caller retries with a fresh one, so two dossiers can never
   *  share a reference. */
  create(input: NewDossier): Promise<void>;
  /** Attach uploaded photo metadata once the reference is known to be unique. */
  attachPhotos(reference: string, photos: DossierPhoto[]): Promise<void>;
  /** Set `paidAt` iff currently null; returns the row on the paying transition,
   *  null if it was already paid or not found (so callers e-mail exactly once). */
  markPaid(match: DossierMatch, paidAtISO: string): Promise<DossierRecord | null>;
  list(): Promise<DossierRecord[]>;
  get(reference: string): Promise<DossierRecord | null>;
  setStatut(reference: string, statut: DossierStatut, atISO: string): Promise<DossierRecord | null>;
}

export type TypeLieu = "maison" | "copro" | "locatif";
export type Statut = "locataire" | "proprio" | "syndic" | "gerant";

/** Étape 2 « Ultra-Light » (spec 003, R2R 2026-07-16). `partiesCommunes` added
 *  2026-07-16 (client) for the pro audience — syndics and gérants d’immeubles. */
export const pieceKeys = [
  "salon",
  "chambre",
  "cuisine",
  "sdb",
  "couloirWc",
  "partiesCommunes",
] as const;
export type PieceKey = (typeof pieceKeys)[number];
export type SurfacePart = "plaf" | "murs" | "sol";

export type RoomSurface = {
  plaf: boolean;
  murs: boolean;
  sol: boolean;
  /** Estimated floor/ceiling surface in m² (free text, e.g. « 12 ») — replaced
   *  the petite/moyenne/grande bands (client + FAQ update, 2026-07-18). */
  surfaceM2: string;
};

export type PhotoItem = {
  id: number;
  name: string;
  url: string;
  status: "ok" | "error";
  /** Shutter time read from the photo's EXIF (« 2026-07-18T14:23:05 »), or
   *  null when the file carries none. The visitor never types it — étape 3
   *  forces a live capture (client, 2026-07-18). */
  takenAt: string | null;
};

/** Everything the visitor enters across the four steps. */
export type FunnelData = {
  // Étape 1 — dossier
  /** Engagement checkbox at the top of étape 1 (2026-07-16, client) — checked by default. */
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
  typeLieu: TypeLieu | "";
  syndic: string;
  statut: Statut | "";
  // The statut sub-answers (proprietaire, resiliationBail, locationMeublee,
  // occupant) were removed 2026-07-16 (client feedback) — see dossier-form.tsx.
  // Étape 2 — questionnaire (only what changes the price of the work)
  dateSinistre: string;
  pieces: Record<PieceKey, boolean>;
  surfaces: Partial<Record<PieceKey, RoomSurface>>;
};

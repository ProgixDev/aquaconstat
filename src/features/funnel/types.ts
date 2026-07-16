export type TypeLieu = "maison" | "copro" | "locatif";
export type Statut = "locataire" | "proprio" | "syndic" | "gerant";

/** Étape 2 « Ultra-Light » (spec 003, R2R 2026-07-16). `partiesCommunes` added
 *  2026-07-16 (client) for the pro audience — syndics and gérants d’immeubles. */
export type PieceKey = "salon" | "chambre" | "cuisine" | "sdb" | "couloirWc" | "partiesCommunes";
export type SurfacePart = "plaf" | "murs" | "sol";
/** An approximate band, not longueur × largeur — enough to price embellishments. */
export type Taille = "" | "petite" | "moyenne" | "grande";

export type RoomSurface = {
  plaf: boolean;
  murs: boolean;
  sol: boolean;
  taille: Taille;
};

export type PhotoItem = {
  id: number;
  name: string;
  url: string;
  status: "ok" | "error";
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

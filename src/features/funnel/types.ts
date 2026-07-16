export type TypeLieu = "maison" | "copro" | "locatif";
export type Statut = "locataire" | "proprio" | "syndic" | "gerant";
export type OuiNon = "oui" | "non";

/** Étape 2 « Ultra-Light » (spec 003, R2R 2026-07-16). */
export type PieceKey = "salon" | "chambre" | "cuisine" | "sdb" | "couloirWc";
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
  proprietaire: string;
  resiliationBail: OuiNon | "";
  locationMeublee: OuiNon | "";
  occupant: "oui" | "non" | "";
  // Étape 2 — questionnaire (only what changes the price of the work)
  dateSinistre: string;
  pieces: Record<PieceKey, boolean>;
  surfaces: Partial<Record<PieceKey, RoomSurface>>;
};

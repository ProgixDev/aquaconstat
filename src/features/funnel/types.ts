export type TypeLieu = "maison" | "copro" | "locatif";
export type Statut = "locataire" | "proprio" | "syndic" | "gerant";
export type OuiNon = "oui" | "non";
export type OuiNonNsp = "oui" | "non" | "nsp";
export type Origine = "moi" | "voisin" | "communes" | "ailleurs";
export type CauseKey = "canal" | "appareil" | "cheneaux" | "infil" | "gel" | "autre";
export type InfilKey = "toiture" | "terrasse" | "facade" | "fenetre" | "joint";
export type PieceKey = "sdb" | "cuisine" | "salon" | "chambre" | "couloir" | "wc" | "autre";
export type SurfacePart = "murs" | "plaf" | "sols";
export type EtatKey = "peintures" | "revetements" | "plinthes" | "parquet";
export type Etat = "" | "intact" | "abime" | "refaire";

export type RoomSurface = {
  murs: boolean;
  plaf: boolean;
  sols: boolean;
  longueur: string;
  largeur: string;
};

export type PhotoItem = {
  id: number;
  name: string;
  url: string;
  status: "ok" | "error";
};

/** Everything the visitor enters across the four steps (constat amiable fields). */
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
  moins10Ans: OuiNonNsp | "";
  usageHabitation: OuiNon | "";
  syndic: string;
  statut: Statut | "";
  proprietaire: string;
  resiliationBail: OuiNon | "";
  locationMeublee: OuiNon | "";
  occupant: "oui" | "non" | "";
  assureur: string;
  numeroContrat: string;
  numeroSinistre: string;
  agent: string;
  adresseAssureur: string;
  // Étape 2 — questionnaire
  dateSinistre: string;
  rechercheFuite: OuiNon | "";
  rechercheFuitePar: string;
  causeIdentifiee: OuiNon | "";
  causeReparee: OuiNon | "";
  origine: Origine | "";
  originePrecision: string;
  causes: Record<CauseKey, boolean>;
  canalType: "commune" | "privative" | "";
  canalFlux: "alim" | "evac" | "";
  canalAcces: "acc" | "nonacc" | "";
  infiltrations: Record<InfilKey, boolean>;
  autreCause: string;
  tiersResponsable: OuiNon | "";
  tiersPourquoi: string;
  tiersNom: string;
  pieces: Record<PieceKey, boolean>;
  surfaces: Partial<Record<PieceKey, RoomSurface>>;
  etats: Record<EtatKey, Etat>;
  humidite: OuiNon | "";
  precisions: string;
};

/**
 * Mock dossiers (spec 004, AC-1) — replaced by the Supabase backend spec.
 * References and copy come from design/prototype/admin-*.dc.html.
 */

export type DossierStatut = "Nouveau" | "En cours" | "Devis envoyé";

export type DossierRow = {
  ref: string;
  nom: string;
  ville: string;
  date: string;
  paye: boolean;
  statut: DossierStatut;
};

export type DossierDetail = DossierRow & {
  email: string;
  telephone: string;
  adresse: string;
  batiment: string;
  usage: string;
  demandeur: string;
  proprietaire: string;
  syndic: string;
  assureur: string;
  numeroContrat: string;
  numeroSinistre: string;
  agent: string;
  paiementDate: string;
  sinistre: { label: string; value: string }[];
  surfaces: { label: string; value: string }[];
  etats: { label: string; value: string }[];
  photos: string[];
};

export const dossiers: DossierRow[] = [
  {
    ref: "AC-2026-0152",
    nom: "Nadia Belkacem",
    ville: "Villeurbanne",
    date: "14 juil. 2026",
    paye: true,
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0151",
    nom: "Thomas Lefebvre",
    ville: "Nantes",
    date: "13 juil. 2026",
    paye: true,
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0150",
    nom: "Marie-Claude Perrin",
    ville: "Bordeaux",
    date: "11 juil. 2026",
    paye: false,
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0149",
    nom: "Julien Roche",
    ville: "Toulouse",
    date: "10 juil. 2026",
    paye: true,
    statut: "En cours",
  },
  {
    ref: "AC-2026-0148",
    nom: "Sophie Anselme",
    ville: "Rennes",
    date: "8 juil. 2026",
    paye: true,
    statut: "En cours",
  },
  {
    ref: "AC-2026-0147",
    nom: "Camille Moreau",
    ville: "Lyon",
    date: "17 juin 2026",
    paye: true,
    statut: "En cours",
  },
  {
    ref: "AC-2026-0146",
    nom: "Karim Haddad",
    ville: "Marseille",
    date: "15 juin 2026",
    paye: true,
    statut: "Devis envoyé",
  },
  {
    ref: "AC-2026-0145",
    nom: "Élise Fontaine",
    ville: "Dijon",
    date: "12 juin 2026",
    paye: true,
    statut: "Devis envoyé",
  },
  {
    ref: "AC-2026-0144",
    nom: "Paul Guérin",
    ville: "Angers",
    date: "9 juin 2026",
    paye: true,
    statut: "Devis envoyé",
  },
];

const detailCamille: DossierDetail = {
  ref: "AC-2026-0147",
  nom: "Camille Moreau",
  ville: "Lyon",
  date: "17 juin 2026",
  paye: true,
  statut: "En cours",
  email: "camille.moreau@gmail.com",
  telephone: "06 42 17 89 03",
  adresse: "12 rue des Lilas, Bât. B, 3ᵉ étage, 69003 Lyon",
  batiment: "Immeuble en copropriété · construit depuis moins de 10 ans : je ne sais pas",
  usage: "Habitation : oui",
  demandeur: "Locataire — bail résilié : non · meublée / saisonnière : non",
  proprietaire: "M. Henri Vasseur — 28 cours Gambetta, 69007 Lyon · 06 71 45 02 88",
  syndic: "Cabinet Berthelot — 4 quai Saint-Antoine, 69002 Lyon · 04 72 10 22 30",
  assureur: "MAIF",
  numeroContrat: "4 582 917 K",
  numeroSinistre: "2026-DDE-08341",
  agent: "—",
  paiementDate: "17 juin 2026, 14 h 32",
  sinistre: [
    { label: "Date", value: "14 juin 2026" },
    { label: "Recherche de fuite", value: "Non" },
    { label: "Cause", value: "Identifiée : oui · réparée : non" },
    { label: "Origine", value: "Chez un voisin" },
    { label: "Nature", value: "Fuite sur canalisation — privative, évacuation, non accessible" },
    { label: "Tiers en cause", value: "Non" },
    { label: "Pièces", value: "Salle de bain · couloir" },
  ],
  surfaces: [
    { label: "Salle de bain", value: "Plafond — 2,1 × 1,8 m" },
    { label: "Couloir", value: "Murs — 3,2 × 1,1 m" },
  ],
  etats: [
    { label: "Peintures", value: "À refaire" },
    { label: "Revêtements muraux", value: "Abîmés" },
    { label: "Plinthes", value: "Abîmées" },
    { label: "Parquet / carrelage", value: "Intact" },
    { label: "Humidité / moisissures", value: "Oui" },
    { label: "Précisions", value: "—" },
  ],
  photos: [
    "vue générale — salle de bain",
    "plafond — salle de bain",
    "zone endommagée — gros plan",
    "mur — couloir",
    "photo-05 — reprise",
  ],
};

/** All rows resolve to the same fully-detailed mock record, re-keyed per row. */
export function getDossier(ref: string): DossierDetail | undefined {
  const row = dossiers.find((d) => d.ref === ref);
  if (!row) return undefined;
  return { ...detailCamille, ...row };
}

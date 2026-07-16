/**
 * Mock dossiers (spec 004) — replaced by the Supabase backend spec.
 *
 * `server-only` is load-bearing, not decoration. This module holds dossier PII,
 * and until 2026-07-16 the list was value-imported by a "use client" table,
 * which shipped all 9 records into a public /_next/static chunk — a path the
 * middleware matcher deliberately excludes, so no gate could ever have closed
 * it. Importing this from a client component is now a build error.
 *
 * The exported readers are also the AUTHORIZATION BOUNDARY: they call
 * requireAdminSession() themselves rather than trusting a layout to have done
 * it (see session.ts for why a layout is not a reliable gate).
 */
import "server-only";
import { requireAdminSession } from "./session";

export type DossierStatut = "Nouveau" | "En cours" | "Devis envoyé";

export type DossierRow = {
  ref: string;
  nom: string;
  ville: string;
  /** ISO 8601. The display string is derived, never stored alongside. */
  createdAt: string;
  /**
   * ISO 8601 when Stripe confirmed payment; null when it failed. The 48 h
   * ouvrées clock starts here — and « is it paid » is read from this, so there
   * is no separate boolean that can contradict it.
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
  proprietaire: string;
  syndic: string;
  sinistre: { label: string; value: string }[];
  /** Per pièce: what to redo + the approximate size band (spec 003, R2R 2026-07-16). */
  surfaces: { label: string; value: string }[];
  /** Mock uploads under /public/mock/dossier — served same-origin so the
      « Télécharger » action is a real download, not a painted door. */
  photos: { label: string; src: string }[];
};

/**
 * Fixture anchored to a fixed « today » of 2026-07-16 so the cockpit shows a
 * legible spread (late / due today / on track / blocked / sent) and so tests
 * stay deterministic. It ages: read far enough past that date and everything
 * unsent reads as late. That is the fixture, not the SLA rule — the backend
 * spec replaces this module wholesale.
 */
const rows: DossierRow[] = [
  {
    ref: "AC-2026-0152",
    nom: "Nadia Belkacem",
    ville: "Villeurbanne",
    createdAt: "2026-07-14T08:55:00Z",
    paidAt: "2026-07-14T09:12:00Z", // deadline jeudi 16 → à rendre aujourd’hui
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0151",
    nom: "Thomas Lefebvre",
    ville: "Nantes",
    createdAt: "2026-07-13T16:20:00Z",
    paidAt: "2026-07-13T16:40:00Z", // deadline mercredi 15 → en retard
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0150",
    nom: "Marie-Claude Perrin",
    ville: "Bordeaux",
    createdAt: "2026-07-11T10:05:00Z",
    paidAt: null, // paiement échoué → bloqué, jamais « en retard »
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0149",
    nom: "Julien Roche",
    ville: "Toulouse",
    createdAt: "2026-07-15T10:48:00Z",
    paidAt: "2026-07-15T11:05:00Z", // deadline vendredi 17 → dans les temps
    statut: "En cours",
  },
  {
    ref: "AC-2026-0148",
    nom: "Sophie Anselme",
    ville: "Rennes",
    createdAt: "2026-07-16T08:05:00Z",
    paidAt: "2026-07-16T08:20:00Z", // deadline lundi 20 (week-end sauté)
    statut: "Nouveau",
  },
  {
    ref: "AC-2026-0147",
    nom: "Camille Moreau",
    ville: "Lyon",
    createdAt: "2026-07-14T14:10:00Z",
    paidAt: "2026-07-14T14:32:00Z", // deadline jeudi 16 → à rendre aujourd’hui
    statut: "En cours",
  },
  {
    ref: "AC-2026-0146",
    nom: "Karim Haddad",
    ville: "Marseille",
    createdAt: "2026-07-09T09:30:00Z",
    paidAt: "2026-07-09T09:44:00Z",
    statut: "Devis envoyé",
  },
  {
    ref: "AC-2026-0145",
    nom: "Élise Fontaine",
    ville: "Dijon",
    createdAt: "2026-07-08T15:12:00Z",
    paidAt: "2026-07-08T15:30:00Z",
    statut: "Devis envoyé",
  },
  {
    ref: "AC-2026-0144",
    nom: "Paul Guérin",
    ville: "Angers",
    createdAt: "2026-07-06T11:02:00Z",
    paidAt: "2026-07-06T11:18:00Z",
    statut: "Devis envoyé",
  },
];

const detailCamille: Omit<DossierDetail, keyof DossierRow> = {
  email: "camille.moreau@gmail.com",
  telephone: "06 42 17 89 03",
  adresse: "12 rue des Lilas, Bât. B, 3ᵉ étage, 69003 Lyon",
  batiment: "Immeuble en copropriété",
  demandeur: "Locataire — bail résilié : non · meublée / saisonnière : non",
  proprietaire: "M. Henri Vasseur — 28 cours Gambetta, 69007 Lyon · 06 71 45 02 88",
  syndic: "Cabinet Berthelot — 4 quai Saint-Antoine, 69002 Lyon · 04 72 10 22 30",
  sinistre: [
    { label: "Date du sinistre", value: "14 juin 2026" },
    { label: "Pièces endommagées", value: "Salle de bain · Couloir/WC" },
  ],
  surfaces: [
    { label: "Salle de bain", value: "Plafond, murs — moyenne (10 à 20 m²)" },
    { label: "Couloir/WC", value: "Murs — petite (moins de 10 m²)" },
  ],
  photos: [
    { label: "vue générale — salle de bain", src: "/mock/dossier/01-vue-generale.jpg" },
    { label: "plafond — salle de bain", src: "/mock/dossier/02-plafond.jpg" },
    { label: "zone endommagée — gros plan", src: "/mock/dossier/03-zone-endommagee.jpg" },
    { label: "mur — couloir", src: "/mock/dossier/04-mur-couloir.jpg" },
    { label: "photo-05 — reprise", src: "/mock/dossier/05-reprise.jpg" },
  ],
};

/**
 * `readAt` travels with the data rather than being stamped in the page.
 *
 * Every SLA countdown is relative to a clock, so the clock is part of the
 * read, not something a component invents: `Date.now()` during render is
 * impure (react-hooks/purity rightly rejects it) and would also give the
 * server and the client two different answers to hydrate against.
 */
export type DossiersRead = { dossiers: DossierRow[]; readAt: number };
export type DossierRead = { dossier: DossierDetail | undefined; readAt: number };

/** Every dossier. Gated: this is the boundary, not the layout. */
export async function getDossiers(): Promise<DossiersRead> {
  await requireAdminSession();
  return { dossiers: rows, readAt: Date.now() };
}

/** All rows resolve to the same fully-detailed mock record, re-keyed per row. */
export async function getDossier(ref: string): Promise<DossierRead> {
  await requireAdminSession();
  const row = rows.find((d) => d.ref === ref);
  return {
    dossier: row ? { ...detailCamille, ...row } : undefined,
    readAt: Date.now(),
  };
}

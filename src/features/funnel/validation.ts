import { pieceKeys, type FunnelData } from "./types";

/**
 * What each step still needs before it can be left, phrased so it can be shown
 * to the visitor as-is.
 *
 * Until now the « Au moins 1 photo est requise » line was decorative: every
 * CTA was a plain link, so a dossier with no name, no rooms and no photos
 * reached the payment page — and could be charged 82,90 € while being
 * impossible to quote. These rules are what the CTAs and the pay button gate on.
 */

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Étape 1 — who the visitor is and where the damage is. */
export function missingForDossier(data: FunnelData): string[] {
  const missing: string[] = [];
  if (!data.prenom.trim()) missing.push("votre prénom");
  if (!data.nom.trim()) missing.push("votre nom");
  if (!emailPattern.test(data.email)) missing.push("un e-mail valide");
  if (!data.adresse.trim()) missing.push("l’adresse du sinistre");
  if (!data.codePostal.trim()) missing.push("le code postal");
  if (!data.ville.trim()) missing.push("la ville");
  if (!data.typeLieu) missing.push("le type de logement");
  if (!data.statut) missing.push("votre statut");
  return missing;
}

/** Étape 2 — what has to be quoted. A room with nothing to redo prices nothing. */
export function missingForQuestionnaire(data: FunnelData): string[] {
  const missing: string[] = [];
  if (!data.dateSinistre) missing.push("la date du sinistre");

  const selected = pieceKeys.filter((key) => data.pieces[key]);
  if (selected.length === 0) {
    missing.push("au moins une pièce touchée");
  } else if (selected.some((key) => !hasWorkToDo(data, key))) {
    missing.push("ce qu’il faut refaire dans chaque pièce cochée");
  }
  return missing;
}

function hasWorkToDo(data: FunnelData, key: (typeof pieceKeys)[number]): boolean {
  const room = data.surfaces[key];
  return room ? Object.keys(room.parts).length > 0 : false;
}

/** Étape 3 — the artisan quotes from the photos; without one there is no devis.
 *  The honour declaration is required too (client, 2026-07-21). */
export function missingForPhotos(okPhotoCount: number, attested: boolean): string[] {
  const missing: string[] = [];
  if (okPhotoCount === 0) missing.push("au moins 1 photo du sinistre");
  if (!attested) missing.push("votre déclaration sur l’honneur");
  return missing;
}

/** Everything étape 4 needs before money can change hands. */
export function missingForPayment(data: FunnelData, okPhotoCount: number): string[] {
  return [
    ...missingForDossier(data),
    ...missingForQuestionnaire(data),
    ...missingForPhotos(okPhotoCount, data.photosAttestation),
  ];
}

/** « a », « a et b », « a, b et c » — French list punctuation. */
export function formatMissing(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

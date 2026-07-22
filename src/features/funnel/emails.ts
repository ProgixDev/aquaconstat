import type { DossierData } from "@/lib/dossiers";
import { pieceKeys, type PieceKey, type SurfacePart } from "./types";

/**
 * The two e-mails a paid dossier produces, as pure content (subject + HTML +
 * plain text). The Resend call lives in the server action; keeping the wording
 * here makes it testable and keeps one canonical « how we describe a dossier
 * to a human » place.
 *
 * Email-first architecture (client, 2026-07-18): the operator e-mail carries
 * the whole dossier so Nino can prepare the devis straight from his inbox and
 * reply to the customer himself.
 */

export type EmailContent = { subject: string; html: string; text: string };

/** Just what the templates need about each attached photo. */
export type PhotoSummary = { name: string; takenAt: string | null };

const typeLieuLabels: Record<string, string> = {
  maison: "Maison particulière",
  copro: "Immeuble en copropriété",
  locatif: "Immeuble locatif",
};

const statutLabels: Record<string, string> = {
  locataire: "Locataire ou occupant non propriétaire",
  proprio: "Propriétaire / copropriétaire",
  syndic: "Syndic de copropriété",
  gerant: "Gérant de l’immeuble / agence",
};

const pieceLabels: Record<PieceKey, string> = {
  salon: "Salon",
  chambre: "Chambre",
  cuisine: "Cuisine",
  sdb: "Salle de bain",
  couloirWc: "Couloir/WC",
  partiesCommunes: "Parties communes (Hall, cage d’escalier…)",
};

/** « 2026-07-10 » → « 10/07/2026 ». */
function frDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** « 2026-07-18T14:23:05 » → « 18/07/2026 à 14 h 23 ». */
function frDateTime(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]} à ${m[4]} h ${m[5]}` : iso;
}

function fullName(d: DossierData): string {
  return [d.prenom, d.nom].filter(Boolean).join(" ").trim() || "—";
}

const partOrder: SurfacePart[] = ["plaf", "murs", "sol"];
const partNames: Record<SurfacePart, string> = { plaf: "plafond", murs: "murs", sol: "sol" };

/** One human line per touched room, each checked part with its own m²:
 *  « Salle de bain — plafond ≈ 12 m², sol ≈ 8 m² ». */
function roomLines(d: DossierData): string[] {
  return pieceKeys
    .filter((key) => d.pieces[key])
    .map((key) => {
      const room = d.surfaces[key];
      const parts = partOrder
        .filter((p) => room && p in room.parts)
        .map((p) => {
          const m2 = room?.parts[p];
          return m2 ? `${partNames[p]} ≈ ${m2} m²` : partNames[p];
        });
      return parts.length ? `${pieceLabels[key]} — ${parts.join(", ")}` : pieceLabels[key];
    });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Operator e-mail — the whole dossier, sent to Nino. Photos ride as
 * attachments (added by the server action), so the body only lists them.
 */
export function buildOperatorEmail(
  data: DossierData,
  reference: string,
  photos: PhotoSummary[],
): EmailContent {
  const rooms = roomLines(data);
  const lieu = [
    data.adresse,
    data.batiment && `Bât. ${data.batiment}`,
    data.etage && `${data.etage} étage`,
    [data.codePostal, data.ville].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const rows: [string, string][] = [
    ["Référence", reference],
    ["Client", fullName(data)],
    ["E-mail", data.email || "—"],
    ["Téléphone", data.telephone || "—"],
    ["Lieu du sinistre", lieu || "—"],
    ["Type de logement", data.typeLieu ? (typeLieuLabels[data.typeLieu] ?? data.typeLieu) : "—"],
    ["Statut", data.statut ? (statutLabels[data.statut] ?? data.statut) : "—"],
    ...(data.syndic ? ([["Syndic / gérant", data.syndic]] as [string, string][]) : []),
    ["Date du sinistre déclaré", data.dateSinistre ? frDate(data.dateSinistre) : "—"],
    ["Devis réclamé par l’assurance", data.assuranceReclame ? "Oui" : "Non"],
    ["Photos attestées sur l’honneur", data.photosAttestation ? "Oui" : "Non"],
  ];

  const photoLines = photos.map(
    (p) => `${p.name}${p.takenAt ? ` — prise le ${frDateTime(p.takenAt)}` : ""}`,
  );

  const text = [
    `Nouveau dossier payé — ${reference}`,
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Pièces touchées :",
    ...(rooms.length ? rooms.map((r) => `  • ${r}`) : ["  (aucune)"]),
    "",
    `Photos (${photos.length}) — en pièces jointes :`,
    ...(photoLines.length ? photoLines.map((l) => `  • ${l}`) : ["  (aucune)"]),
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#12283e;max-width:640px">
      <h2 style="margin:0 0 4px">Nouveau dossier payé</h2>
      <p style="margin:0 0 16px;color:#446c93;font-size:14px">Référence <strong>${escapeHtml(
        reference,
      )}</strong></p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#8aa9c6;white-space:nowrap;vertical-align:top">${escapeHtml(
                label,
              )}</td><td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <h3 style="margin:20px 0 6px;font-size:15px">Pièces touchées</h3>
      <ul style="margin:0;padding-left:18px;font-size:14px">
        ${
          rooms.length
            ? rooms.map((r) => `<li>${escapeHtml(r)}</li>`).join("")
            : "<li>(aucune)</li>"
        }
      </ul>
      <h3 style="margin:20px 0 6px;font-size:15px">Photos (${photos.length}) — en pièces jointes</h3>
      <ul style="margin:0;padding-left:18px;font-size:14px">
        ${
          photoLines.length
            ? photoLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")
            : "<li>(aucune)</li>"
        }
      </ul>
    </div>`.trim();

  return { subject: `Nouveau dossier ${reference} — ${fullName(data)}`, html, text };
}

/**
 * Customer e-mail — the confirmation the visitor is promised on-screen.
 */
export function buildCustomerEmail(data: DossierData, reference: string): EmailContent {
  const hello = data.prenom ? `Bonjour ${data.prenom},` : "Bonjour,";
  const text = [
    hello,
    "",
    "Nous avons bien reçu votre dossier de dégât des eaux et votre paiement.",
    `Votre référence : ${reference}`,
    "",
    "Un professionnel prépare votre devis détaillé. Vous le recevrez par e-mail sous 48 h ouvrées, prêt à être transmis à votre assurance.",
    "",
    "Une question ? Répondez simplement à cet e-mail.",
    "",
    "Ôlala — Du sinistre à la solution.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#12283e;max-width:560px;line-height:1.6">
      <p>${escapeHtml(hello)}</p>
      <p>Nous avons bien reçu votre dossier de dégât des eaux et votre paiement.</p>
      <p style="margin:16px 0;padding:12px 16px;background:#e4f1fd;border-radius:8px">
        Votre référence : <strong>${escapeHtml(reference)}</strong>
      </p>
      <p>Un professionnel prépare votre devis détaillé. Vous le recevrez par e-mail
      <strong>sous 48 h ouvrées</strong>, prêt à être transmis à votre assurance.</p>
      <p style="color:#446c93">Une question ? Répondez simplement à cet e-mail.</p>
      <p style="margin-top:24px;font-style:italic;color:#446c93">Ôlala — Du sinistre à la solution.</p>
    </div>`.trim();

  return { subject: `Votre dossier Ôlala est bien reçu — ${reference}`, html, text };
}

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
  maison: "Maison individuelle",
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

// Email-safe styling: tables + inline styles only (no flexbox/grid, no web fonts,
// no external CSS — Outlook and Gmail strip all of it). Brand palette from
// globals.css: navy #133a5f, navy-deep #0d2842, aqua #5aa9e6, aqua-pale #a8d6fa,
// mist #d6ecfd, link #2e7fc2, steel #446c93, success #1b7d6e.
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

/** Branded wrapper: navy header with the wordmark, aqua rule, footer slogan. */
function shell(title: string, preheader: string, content: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    title,
  )}</title></head>
<body style="margin:0;padding:0;background:#d6ecfd;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#d6ecfd;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fdfeff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0d2842;padding:22px 32px;">
<span style="font-family:${SERIF};font-size:24px;font-weight:700;letter-spacing:4px;color:#fdfeff;">ÔLALA</span>
<div style="font-family:${FONT};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8d6fa;margin-top:4px;">Du sinistre à la solution</div>
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:4px;background:#5aa9e6;">&nbsp;</td></tr>
<tr><td style="padding:32px;font-family:${FONT};color:#133a5f;font-size:14px;line-height:1.6;">${content}</td></tr>
<tr><td style="background:#f4faff;border-top:1px solid #d6ecfd;padding:20px 32px;font-family:${FONT};">
<div style="font-family:${SERIF};font-weight:700;color:#133a5f;font-size:15px;">Ôlala — Du sinistre à la solution.</div>
<div style="color:#446c93;font-size:12px;margin-top:4px;">Devis dégât des eaux à distance — France métropolitaine.</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

/** The reference in a mist chip — the one thing to keep. */
function referenceBox(reference: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#d6ecfd;border:1px solid #a8d6fa;border-radius:10px;padding:12px 18px;">
<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2e7fc2;">Référence</div>
<div style="font-family:${SERIF};font-size:20px;font-weight:700;letter-spacing:1px;color:#133a5f;margin-top:2px;">${escapeHtml(
    reference,
  )}</div>
</td></tr></table>`;
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

  const row = ([label, value]: [string, string]) =>
    `<tr>
<td style="padding:8px 14px 8px 0;color:#446c93;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eef6fd;">${escapeHtml(
      label,
    )}</td>
<td style="padding:8px 0;color:#133a5f;font-weight:600;border-bottom:1px solid #eef6fd;">${escapeHtml(
      value,
    )}</td>
</tr>`;
  const list = (items: string[]) =>
    `<ul style="margin:0;padding-left:18px;color:#133a5f;">${
      items.length
        ? items.map((i) => `<li style="margin:3px 0;">${escapeHtml(i)}</li>`).join("")
        : "<li>(aucune)</li>"
    }</ul>`;
  const sectionTitle = (t: string) =>
    `<h3 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#2e7fc2;">${t}</h3>`;

  const content = `<h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#133a5f;">Nouveau dossier payé</h1>
<p style="margin:0 0 18px;color:#446c93;">Un client vient de régler l’étude de son dossier.</p>
${referenceBox(reference)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-collapse:collapse;">${rows
    .map(row)
    .join("")}</table>
${sectionTitle("Pièces touchées")}${list(rooms)}
${sectionTitle(`Photos (${photos.length}) — en pièces jointes`)}${list(photoLines)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>
<td style="background:#e8f6ec;border-radius:10px;padding:14px 18px;color:#1b7d6e;font-size:13px;line-height:1.5;">
<strong>Pour envoyer le devis :</strong> répondez simplement à cet e-mail — votre réponse partira directement au client${
    data.email ? ` (${escapeHtml(data.email)})` : ""
  }.
</td></tr></table>`;

  const html = shell(`Nouveau dossier ${reference}`, `${fullName(data)} — dossier payé`, content);

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

  const content = `<h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#133a5f;">${escapeHtml(
    hello,
  )}</h1>
<p style="margin:0 0 4px;">Nous avons bien reçu votre dossier de dégât des eaux et votre paiement.</p>
<div style="margin:18px 0;">${referenceBox(reference)}</div>
<p style="margin:0 0 16px;">Un professionnel prépare votre devis détaillé. Vous le recevrez par e-mail <strong>sous 48 h ouvrées</strong>, prêt à être transmis à votre assurance.</p>
<p style="margin:0;color:#446c93;">Une question ? Répondez simplement à cet e-mail.</p>`;

  const html = shell(
    `Votre dossier Ôlala — ${reference}`,
    "Bien reçu — votre devis vous sera envoyé sous 48 h ouvrées.",
    content,
  );

  return { subject: `Votre dossier Ôlala est bien reçu — ${reference}`, html, text };
}

import { site } from "@/core/site";
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
// no external CSS — Outlook and Gmail strip all of it). Gradients always carry a
// solid background-color fallback for the clients that drop them. Palette from
// globals.css: navy #133a5f, navy-deep #0d2842, navy-light #1d5688, aqua #5aa9e6,
// aqua-bright #7fc8f8, aqua-pale #a8d6fa, mist #d6ecfd, link #2e7fc2, steel
// #446c93, success #1b7d6e, primary/yellow #ffe45e.
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
// The signature photoreal droplet from the hero, served from the site.
const DROPLET = `${site.url}/droplet.png`;

/**
 * Branded wrapper matched to the site: a navy hero band with the droplet + the
 * wordmark, an aqua→yellow accent rule, a white panel, and the footer slogan —
 * on a soft aqua page like the funnel background.
 */
function shell(title: string, preheader: string, content: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    title,
  )}</title></head>
<body style="margin:0;padding:0;background-color:#eaf4fd;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eaf4fd;background-image:linear-gradient(180deg,#d6ecfd 0%,#eaf4fd 32%);padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fdfeff;border-radius:16px;overflow:hidden;border:1px solid #cfe6fb;">
<tr><td align="center" style="background-color:#0d2842;background-image:linear-gradient(135deg,#0d2842 0%,#1d5688 100%);padding:34px 32px 28px;">
<img src="${DROPLET}" width="54" height="54" alt="Ôlala" style="display:block;border:0;outline:none;margin:0 auto 12px;" />
<div style="font-family:${SERIF};font-size:26px;font-weight:700;letter-spacing:5px;color:#fdfeff;">ÔLALA</div>
<div style="font-family:${FONT};font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#a8d6fa;margin-top:6px;">Du sinistre à la solution</div>
</td></tr>
<tr><td style="height:3px;line-height:3px;font-size:3px;background-color:#5aa9e6;background-image:linear-gradient(90deg,#7fc8f8 0%,#5aa9e6 55%,#ffe45e 100%);">&nbsp;</td></tr>
<tr><td style="padding:34px 34px 30px;font-family:${FONT};color:#133a5f;font-size:15px;line-height:1.62;">${content}</td></tr>
<tr><td align="center" style="background:#f4faff;border-top:1px solid #e0f0fd;padding:22px 34px;font-family:${FONT};">
<div style="font-family:${SERIF};font-weight:700;color:#133a5f;font-size:15px;">Ôlala — Du sinistre à la solution.</div>
<div style="color:#446c93;font-size:12px;margin-top:5px;">Devis dégât des eaux à distance — France métropolitaine.</div>
</td></tr>
</table>
<div style="font-family:${FONT};color:#8fb3d4;font-size:11px;margin-top:16px;">olala-degatdeseaux.fr</div>
</td></tr>
</table>
</body></html>`;
}

/** The reference in an aqua-gradient ring — the confirmation page's jewel. */
function referenceRing(reference: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr><td style="border-radius:14px;background-color:#5aa9e6;background-image:linear-gradient(135deg,#7fc8f8 0%,#5aa9e6 100%);padding:2px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:#fdfeff;border-radius:12px;padding:13px 30px;">
<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2e7fc2;">Référence</div>
<div style="font-family:${SERIF};font-size:22px;font-weight:700;letter-spacing:2px;color:#133a5f;margin-top:3px;">${escapeHtml(
    reference,
  )}</div>
</td></tr></table>
</td></tr></table>`;
}

/** « La suite » — numbered circles linked as a journey, like /confirmation. */
function timeline(steps: readonly (readonly [string, string])[]): string {
  return steps
    .map(([t, d], i) => {
      const pad = i < steps.length - 1 ? "18px" : "0";
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="30" valign="top" style="padding:0 0 ${pad};">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" style="background-color:#5aa9e6;background-image:linear-gradient(135deg,#7fc8f8,#5aa9e6);border-radius:50%;color:#ffffff;font-family:${FONT};font-size:14px;font-weight:700;">${
        i + 1
      }</td></tr></table>
</td>
<td valign="top" style="padding:3px 0 ${pad} 13px;">
<div style="font-weight:700;color:#133a5f;font-size:15px;">${escapeHtml(t)}</div>
<div style="color:#446c93;font-size:13px;margin-top:2px;">${escapeHtml(d)}</div>
</td></tr></table>`;
    })
    .join("");
}

const SUITE: readonly (readonly [string, string])[] = [
  ["Étude du dossier", "Un professionnel examine vos réponses et vos photos."],
  ["Préparation du devis", "Chiffrage poste par poste des travaux de remise en état."],
  ["Envoi par e-mail", "Votre devis détaillé, prêt à être transmis à votre assurance."],
];

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

  // Photos live in the private bucket, viewed from the back-office — not
  // attached, so they stay in one place the retention job can actually purge.
  const adminUrl = `${site.url}/admin/dossiers/${encodeURIComponent(reference)}`;

  const text = [
    `Nouveau dossier payé — ${reference}`,
    "",
    `Voir le dossier et les photos : ${adminUrl}`,
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Pièces touchées :",
    ...(rooms.length ? rooms.map((r) => `  • ${r}`) : ["  (aucune)"]),
    "",
    `Photos (${photos.length}) :`,
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

  const content = `<div style="text-align:center;">
<div style="font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#2e7fc2;">Back-office · nouveau dossier</div>
<h1 style="margin:6px 0 4px;font-family:${SERIF};font-size:24px;font-weight:700;color:#133a5f;">Dossier payé ✓</h1>
<p style="margin:0 0 22px;color:#446c93;">Un client vient de régler l’étude de son dossier.</p>
${referenceRing(reference)}
<div style="margin-top:22px;">
<a href="${adminUrl}" style="display:inline-block;background-color:#ffe45e;color:#133a5f;font-family:${FONT};font-weight:700;font-size:15px;text-decoration:none;padding:13px 30px;border-radius:999px;">Voir le dossier et les photos &rarr;</a>
</div>
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-collapse:collapse;">${rows
    .map(row)
    .join("")}</table>
${sectionTitle("Pièces touchées")}${list(rooms)}
${sectionTitle(`Photos (${photos.length})`)}${list(photoLines)}
<p style="margin:8px 0 0;color:#8fb3d4;font-size:12px;">Les photos sont consultables dans le back-office (bouton ci-dessus).</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr>
<td style="background-color:#e8f6ec;border:1px solid #cdeed7;border-radius:12px;padding:15px 18px;color:#1b7d6e;font-size:13px;line-height:1.55;">
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

  const merci = data.prenom ? `Merci ${data.prenom},` : "Merci,";
  const content = `<div style="text-align:center;">
<h1 style="margin:0 0 8px;font-family:${SERIF};font-size:25px;font-weight:700;color:#133a5f;">${escapeHtml(
    merci,
  )} votre dossier est bien reçu.</h1>
<p style="margin:0 0 22px;color:#446c93;">Nous avons bien reçu votre dossier de dégât des eaux et votre paiement.</p>
${referenceRing(reference)}
</div>
<p style="margin:24px 0 4px;">Un professionnel prépare votre devis détaillé. Vous le recevrez par e-mail <strong>sous 48 h ouvrées</strong>, prêt à être transmis à votre assurance.</p>
<div style="text-align:center;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#2e7fc2;margin:30px 0 18px;">La suite</div>
${timeline(SUITE)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td align="center" style="border-top:1px solid #e0f0fd;padding-top:18px;color:#446c93;font-size:13px;">
Une question ? Répondez simplement à cet e-mail.
</td></tr></table>`;

  const html = shell(
    `Votre dossier Ôlala — ${reference}`,
    "Bien reçu — votre devis vous sera envoyé sous 48 h ouvrées.",
    content,
  );

  return { subject: `Votre dossier Ôlala est bien reçu — ${reference}`, html, text };
}

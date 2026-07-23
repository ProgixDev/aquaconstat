"use server";

import { z } from "zod";
import {
  dossierStore,
  uploadDossierPhotos,
  type DossierData,
  type UploadablePhoto,
} from "@/lib/dossiers";
import { isEmailLive, operatorAddress, sendEmail, type EmailAttachment } from "@/lib/email";
import { createCheckout, getCheckout, isPaymentLive } from "@/lib/payments";
import { buildCustomerEmail, buildOperatorEmail, type PhotoSummary } from "./emails";

/**
 * Funnel server actions (spec 006, email-first). Two steps, both server-owned:
 * `startCheckout` mints the reference and opens the checkout; `confirmAndSend`
 * runs on the confirmation page once payment is verified, e-mailing the whole
 * dossier (photos attached) to the operator and a confirmation to the customer.
 *
 * The reference is generated here, never trusted from the browser, and travels
 * through the checkout so `confirmAndSend` reads it back from the verified
 * session — a forged session id or an unpaid one sends nothing.
 */

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const roomSchema = z.object({
  // One optional m² string per touched part — see RoomSurface in types.ts.
  // `partialRecord`, not `record`: a plain record over an enum key makes every
  // part required, but a room only carries the parts the visitor checked.
  parts: z.partialRecord(z.enum(["plaf", "murs", "sol"]), z.string()),
});

const dossierSchema = z.object({
  assuranceReclame: z.boolean(),
  prenom: z.string(),
  nom: z.string(),
  email: z.string(),
  telephone: z.string(),
  adresse: z.string(),
  batiment: z.string(),
  etage: z.string(),
  codePostal: z.string(),
  ville: z.string(),
  typeLieu: z.enum(["maison", "copro", "locatif", ""]),
  syndic: z.string(),
  statut: z.enum(["locataire", "proprio", "syndic", "gerant", ""]),
  dateSinistre: z.string(),
  pieces: z.record(z.string(), z.boolean()),
  surfaces: z.record(z.string(), roomSchema),
  photosAttestation: z.boolean(),
});

const photosMetaSchema = z.array(z.object({ name: z.string(), takenAt: z.string().nullable() }));

function generateReference(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  // Year is read at call time, not hardcoded: a literal "2026" would still be
  // printed on every devis and insurance e-mail in January. The NNNN shape is
  // unchanged — widening it is the client's open question (spec 006).
  return `AC-${new Date().getFullYear()}-${n}`;
}

/** How many fresh references to try before giving up on a collision. */
const MAX_REFERENCE_ATTEMPTS = 5;

/**
 * The funnel's zod shape → the persisted contract. Mostly identity; `surfaces`
 * needs its optional per-part m² values narrowed to plain strings.
 */
function toDossierData(parsed: z.infer<typeof dossierSchema>): DossierData {
  const surfaces: DossierData["surfaces"] = {};
  for (const [room, value] of Object.entries(parsed.surfaces)) {
    const parts: Record<string, string> = {};
    for (const [part, m2] of Object.entries(value.parts)) {
      if (typeof m2 === "string") parts[part] = m2;
    }
    surfaces[room] = { parts };
  }
  return { ...parsed, surfaces };
}

/**
 * Étape 4 « Payer » — persists the dossier and its photos BEFORE handing the
 * visitor to Stripe, so nothing depends on the browser surviving the redirect.
 * The reference is server-owned and unique (retried on collision); payment is
 * confirmed later by the webhook, never here.
 */
export async function startCheckout(
  formData: FormData,
): Promise<{ url: string; reference: string }> {
  const parsed = dossierSchema.safeParse(JSON.parse(String(formData.get("dossier") ?? "{}")));
  if (!parsed.success) throw new Error("Dossier invalide.");
  const data = toDossierData(parsed.data);
  const email = z.string().email().catch("").parse(data.email);

  // Photos arrive already downscaled by the browser; re-check the cap server-side.
  const meta = photosMetaSchema
    .catch([])
    .parse(JSON.parse(String(formData.get("photosMeta") ?? "[]")));
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const uploadable: UploadablePhoto[] = [];
  for (const [i, file] of files.entries()) {
    if (file.size === 0 || file.size > MAX_PHOTO_BYTES) continue;
    uploadable.push({
      name: meta[i]?.name ?? file.name,
      takenAt: meta[i]?.takenAt ?? null,
      bytes: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "image/jpeg",
    });
  }

  // Claim a unique reference first, then attach the photos to it.
  let reference = "";
  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const candidate = generateReference();
    try {
      await dossierStore.create({ reference: candidate, data });
      reference = candidate;
      break;
    } catch (err) {
      if (attempt === MAX_REFERENCE_ATTEMPTS) throw err;
    }
  }

  const photos = await uploadDossierPhotos(reference, uploadable);
  if (photos.length > 0) await dossierStore.attachPhotos(reference, photos);

  const { url } = await createCheckout({ reference, customerEmail: email });
  return { url, reference };
}

export type ConfirmResult = {
  ok: boolean;
  reference: string;
  email: string;
  /** True only if the e-mails were really sent (vs logged in simulation). */
  emailLive: boolean;
  error?: "unpaid" | "invalid";
};

export async function confirmAndSend(formData: FormData): Promise<ConfirmResult> {
  const sessionId = z.string().min(1).catch("").parse(formData.get("sessionId"));

  // Nothing is sent until Stripe (or the demo) confirms the payment.
  const checkout = await getCheckout(sessionId);
  if (!checkout.paid) {
    return { ok: false, reference: "", email: "", emailLive: isEmailLive, error: "unpaid" };
  }

  let dossier: DossierData;
  let photosMeta: PhotoSummary[];
  try {
    dossier = toDossierData(
      dossierSchema.parse(JSON.parse(String(formData.get("dossier") ?? "{}"))),
    );
    photosMeta = photosMetaSchema.parse(JSON.parse(String(formData.get("photosMeta") ?? "[]")));
  } catch {
    return {
      ok: false,
      reference: checkout.reference,
      email: checkout.email,
      emailLive: isEmailLive,
      error: "invalid",
    };
  }

  // LIVE: the signature-verified webhook is the only thing allowed to claim a
  // payment and send (spec AC-3). This page just reports the reference back, so
  // it never races the webhook, never re-uploads the photos the visitor already
  // sent at checkout, and can never show « envoi impossible » for a dossier the
  // webhook handled perfectly well.
  if (isPaymentLive) {
    return {
      ok: true,
      reference: checkout.reference,
      email: checkout.email,
      emailLive: isEmailLive,
    };
  }

  // SIMULATION only: there is no webhook, so this page claims it instead.
  // `markPaid` still transitions once, so a refresh cannot double-send.
  const claimed = await dossierStore.markPaid(
    { reference: checkout.reference },
    new Date().toISOString(),
  );
  if (!claimed) {
    return {
      ok: true,
      reference: checkout.reference,
      email: checkout.email,
      emailLive: isEmailLive,
    };
  }

  // Zip each uploaded file with its metadata; drop anything over the cap
  // server-side (AC-2) rather than trusting the client's own check.
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const attachments: EmailAttachment[] = [];
  const summaries: PhotoSummary[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    if (file.size === 0 || file.size > MAX_PHOTO_BYTES) continue;
    attachments.push({
      filename: photosMeta[i]?.name ?? file.name,
      content: Buffer.from(await file.arrayBuffer()),
    });
    summaries.push(photosMeta[i] ?? { name: file.name, takenAt: null });
  }

  const operatorMsg = buildOperatorEmail(dossier, checkout.reference, summaries);
  const customerMsg = buildCustomerEmail(dossier, checkout.reference);

  // Operator first — that's the one the business can't afford to lose.
  await sendEmail({
    to: operatorAddress,
    replyTo: checkout.email || undefined,
    ...operatorMsg,
    attachments,
  });
  if (checkout.email) {
    await sendEmail({ to: checkout.email, ...customerMsg });
  }

  return {
    ok: true,
    reference: checkout.reference,
    email: checkout.email,
    emailLive: isEmailLive,
  };
}

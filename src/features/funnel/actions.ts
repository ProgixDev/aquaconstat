"use server";

import { z } from "zod";
import { isEmailLive, sendEmail, type EmailAttachment } from "@/lib/email";
import { createCheckout, getCheckout } from "@/lib/payments";
import { env } from "@/core/env";
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
/** Where dossiers land when OPERATOR_EMAIL isn't configured (simulation). */
const OPERATOR_FALLBACK = "operateur@olala.demo";

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
  // Server-owned; a real backend would guarantee uniqueness against a table.
  const n = Math.floor(1000 + Math.random() * 9000);
  return `AC-2026-${n}`;
}

export async function startCheckout(rawEmail: string): Promise<{ url: string; reference: string }> {
  const email = z.string().email().catch("").parse(rawEmail);
  const reference = generateReference();
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

  let dossier: z.infer<typeof dossierSchema>;
  let photosMeta: PhotoSummary[];
  try {
    dossier = dossierSchema.parse(JSON.parse(String(formData.get("dossier") ?? "{}")));
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

  const operatorEmail = env.OPERATOR_EMAIL ?? OPERATOR_FALLBACK;
  const operatorMsg = buildOperatorEmail(dossier, checkout.reference, summaries);
  const customerMsg = buildCustomerEmail(dossier, checkout.reference);

  // Operator first — that's the one the business can't afford to lose.
  await sendEmail({ to: operatorEmail, ...operatorMsg, attachments });
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

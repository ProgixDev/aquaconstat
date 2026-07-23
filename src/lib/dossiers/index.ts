import "server-only";
import { env } from "@/core/env";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";
import type { DossierStore } from "./types";

/**
 * Dossier persistence seam. With SUPABASE_SERVICE_ROLE_KEY set, dossiers live in
 * Postgres (real back-office); without it, an in-memory store stands in so the
 * funnel and admin work end-to-end in dev with no cloud. Paste the key and the
 * back-office is real — no code change, same as the e-mail and payment seams.
 */
export const isDossierStoreLive = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * SECURITY / DATA-LOSS: this is the mirror image of the payments seam, and it
 * fails closed for the same reason (see src/lib/payments.ts).
 *
 * The two seams key on DIFFERENT variables — payments on STRIPE_SECRET_KEY,
 * this one on SUPABASE_SERVICE_ROLE_KEY. A production deploy with Stripe
 * configured and Supabase NOT would take real 82,90 € payments while writing
 * dossiers into a per-instance Map: they vanish on the next cold start, /admin
 * shows the nine fake seeds, and the webhook's markPaid hits a different
 * instance than the one that created the row, so the operator e-mail never
 * fires. A paid customer would simply disappear.
 *
 * In production the real store is therefore required, unless a staging deploy
 * opts out deliberately.
 */
const memoryStoreAllowed = env.NODE_ENV !== "production" || env.ALLOW_MEMORY_STORE === "1";

if (!isDossierStoreLive && !memoryStoreAllowed) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing in production: refusing to serve dossiers from the in-memory store, which would lose paid dossiers.",
  );
}

export const dossierStore: DossierStore = isDossierStoreLive ? supabaseStore : memoryStore;

export {
  deleteDossierPhotos,
  fetchDossierPhotos,
  isPhotoStorageLive,
  signDossierPhotos,
  uploadDossierPhotos,
  type UploadablePhoto,
} from "./photos";

export {
  deleteDossier,
  purgeExpiredDossiers,
  PAID_RETENTION_DAYS,
  UNPAID_RETENTION_DAYS,
  type PurgeResult,
} from "./retention";

export type {
  DossierData,
  DossierMatch,
  DossierPhoto,
  DossierRecord,
  DossierStatut,
  DossierStore,
  NewDossier,
  ResolvedPhoto,
} from "./types";

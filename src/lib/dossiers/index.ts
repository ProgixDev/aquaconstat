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

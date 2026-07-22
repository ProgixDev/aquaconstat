import "server-only";
import { env } from "@/core/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DossierPhoto, ResolvedPhoto } from "./types";

/**
 * Dossier photos in the PRIVATE `dossier-photos` bucket (spec 006, client
 * 2026-07-22). Uploaded at checkout so nothing depends on the browser staying
 * open; the admin only ever sees short-lived SIGNED URLs, and the bucket has no
 * public access and no storage policies (service role bypasses RLS).
 *
 * Simulation (no SUPABASE_SERVICE_ROLE_KEY): every call is a no-op and photos
 * keep travelling by e-mail from the confirmation page, exactly as before — so
 * dev and e2e run with no cloud.
 */

const BUCKET = "dossier-photos";
/** Signed URLs are deliberately short — a leaked admin link dies quickly. */
const SIGNED_URL_TTL_SECONDS = 60 * 30;

export const isPhotoStorageLive = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

export type UploadablePhoto = {
  name: string;
  takenAt: string | null;
  bytes: Buffer;
  contentType: string;
};

/** Keeps object keys predictable and safe (no traversal, no spaces). */
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Uploads a dossier's photos, returning the metadata to persist on the row. */
export async function uploadDossierPhotos(
  reference: string,
  files: UploadablePhoto[],
): Promise<DossierPhoto[]> {
  if (!isPhotoStorageLive || files.length === 0) return [];
  const supabase = createAdminClient();
  const stored: DossierPhoto[] = [];
  for (const [i, file] of files.entries()) {
    const path = `${reference}/${String(i + 1).padStart(2, "0")}-${safeName(file.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file.bytes, { contentType: file.contentType, upsert: true });
    if (error) throw new Error(`photo upload failed (${path}): ${error.message}`);
    stored.push({ path, name: file.name, takenAt: file.takenAt });
  }
  return stored;
}

/**
 * Resolves stored photos to renderable URLs. In simulation the `path` already
 * IS a public mock path (`/mock/dossier/…`), so it is returned as-is.
 */
export async function signDossierPhotos(photos: DossierPhoto[]): Promise<ResolvedPhoto[]> {
  if (photos.length === 0) return [];
  if (!isPhotoStorageLive) return photos.map((p) => ({ ...p, url: p.path }));
  const supabase = createAdminClient();
  const resolved: ResolvedPhoto[] = [];
  for (const photo of photos) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(photo.path, SIGNED_URL_TTL_SECONDS);
    resolved.push({ ...photo, url: data?.signedUrl ?? "" });
  }
  return resolved;
}

/** Downloads the photos so the webhook can attach them to the operator e-mail. */
export async function fetchDossierPhotos(
  photos: DossierPhoto[],
): Promise<{ filename: string; content: Buffer }[]> {
  if (!isPhotoStorageLive || photos.length === 0) return [];
  const supabase = createAdminClient();
  const files: { filename: string; content: Buffer }[] = [];
  for (const photo of photos) {
    const { data, error } = await supabase.storage.from(BUCKET).download(photo.path);
    if (error || !data) continue; // a missing object must not block the e-mail
    files.push({ filename: photo.name, content: Buffer.from(await data.arrayBuffer()) });
  }
  return files;
}

/** Removes every object for a dossier — used by delete-on-request and retention. */
export async function deleteDossierPhotos(reference: string): Promise<void> {
  if (!isPhotoStorageLive) return;
  const supabase = createAdminClient();
  const { data } = await supabase.storage.from(BUCKET).list(reference);
  if (!data?.length) return;
  await supabase.storage.from(BUCKET).remove(data.map((o) => `${reference}/${o.name}`));
}

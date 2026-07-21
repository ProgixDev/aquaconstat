/**
 * Client-side photo downscaling.
 *
 * The funnel emails 4–8 photos straight to the operator (no storage bucket in
 * the email-first architecture), and phone shots are 3–8 MB each — eight of
 * them blow past any provider's attachment limit. A dégât-des-eaux quote needs
 * to *see* the damage, not print it: 1600 px on the long edge at JPEG 0.8 is
 * plenty, and brings a batch back under one email's worth.
 *
 * The dimension maths is split out and pure so it can be tested; the canvas
 * draw is a thin browser-only wrapper around it.
 */

/** Longest edge we keep — enough detail to quote from, small enough to email. */
export const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;

/**
 * Scales (w, h) so the longest edge is at most `maxEdge`, never upscaling.
 * Returns integer pixels.
 */
export function computeTargetSize(
  width: number,
  height: number,
  maxEdge: number = MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest === 0) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const ratio = maxEdge / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/**
 * Downscales an image file to a JPEG Blob no wider/taller than {@link MAX_EDGE}.
 * Returns the original file untouched if it isn't a decodable raster image
 * (e.g. an unsupported HEIC the browser can't paint) — the caller still gets a
 * usable Blob rather than an error.
 */
export async function downscaleImage(file: File): Promise<Blob> {
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // undecodable (some HEIC, corrupt data) — send as-is
  }

  try {
    const { width, height } = computeTargetSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    // Only take the downscaled copy if it's actually smaller.
    return blob && blob.size < file.size ? blob : file;
  } finally {
    bitmap.close();
  }
}

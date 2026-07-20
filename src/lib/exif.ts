/**
 * Minimal EXIF reader — extracts only `DateTimeOriginal` (tag 0x9003), the
 * moment the shutter actually fired.
 *
 * Since étape 3 forces a live capture (client, 2026-07-18), the shot's real
 * timestamp is evidence: the visitor types nothing, we read it off the file.
 * One tag doesn't justify a full EXIF dependency, so this walks the JPEG
 * segments and the TIFF IFDs directly.
 *
 * Returns `null` — never throws — when the file isn't a JPEG, carries no EXIF,
 * or has been stripped of it (some browsers and privacy settings do this).
 * Callers must treat a missing date as normal, not as an error.
 */

const APP1 = 0xffe1;
const SOS = 0xffda;
const TAG_EXIF_IFD = 0x8769;
const TAG_DATE_TIME_ORIGINAL = 0x9003;

/** Visits every entry of one IFD, passing the tag id and the entry offset. */
function eachEntry(
  view: DataView,
  ifd: number,
  littleEndian: boolean,
  visit: (tag: number, entry: number) => void,
): void {
  if (ifd + 2 > view.byteLength) return;
  const count = view.getUint16(ifd, littleEndian);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > view.byteLength) return;
    visit(view.getUint16(entry, littleEndian), entry);
  }
}

/** « 2026:07:18 14:23:05 » → « 2026-07-18T14:23:05 » (EXIF has no timezone). */
function toIsoLocal(exifDate: string): string | null {
  const match = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(exifDate.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

/** Reads the ASCII value of an entry whose payload sits at a TIFF offset. */
function readAscii(view: DataView, tiff: number, entry: number, littleEndian: boolean): string {
  const length = view.getUint32(entry + 4, littleEndian);
  const at = tiff + view.getUint32(entry + 8, littleEndian);
  let out = "";
  for (let i = 0; i < length - 1 && at + i < view.byteLength; i++) {
    out += String.fromCharCode(view.getUint8(at + i));
  }
  return out;
}

/** Walks IFD0 → Exif IFD looking for DateTimeOriginal. */
function readTiff(view: DataView, tiff: number): string | null {
  if (tiff + 8 > view.byteLength) return null;
  const order = view.getUint16(tiff);
  // "II" = Intel (little-endian), "MM" = Motorola (big-endian).
  const littleEndian = order === 0x4949;
  if (!littleEndian && order !== 0x4d4d) return null;
  if (view.getUint16(tiff + 2, littleEndian) !== 0x002a) return null;

  const ifd0 = tiff + view.getUint32(tiff + 4, littleEndian);
  let exifIfd: number | null = null;
  eachEntry(view, ifd0, littleEndian, (tag, entry) => {
    if (tag === TAG_EXIF_IFD) exifIfd = tiff + view.getUint32(entry + 8, littleEndian);
  });
  if (exifIfd === null) return null;

  let raw: string | null = null;
  eachEntry(view, exifIfd, littleEndian, (tag, entry) => {
    if (tag === TAG_DATE_TIME_ORIGINAL) raw = readAscii(view, tiff, entry, littleEndian);
  });
  return raw ? toIsoLocal(raw) : null;
}

/** Parses an already-loaded JPEG head. Exported for tests. */
export function parseDateTimeOriginal(buffer: ArrayBuffer): string | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // not a JPEG

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) return null; // out of sync — give up
    if (marker === SOS) return null; // image data starts: no EXIF before it
    const size = view.getUint16(offset + 2);
    if (marker === APP1) {
      const header = offset + 4;
      // "Exif\0\0" precedes the TIFF block.
      if (
        header + 6 <= view.byteLength &&
        view.getUint32(header) === 0x45786966 &&
        view.getUint16(header + 4) === 0x0000
      ) {
        return readTiff(view, header + 6);
      }
    }
    if (size < 2) return null;
    offset += 2 + size;
  }
  return null;
}

/**
 * Reads the capture timestamp of a photo, or `null` if unavailable.
 * Only the head of the file is loaded — EXIF always sits near the start.
 */
export async function readCaptureDate(file: File): Promise<string | null> {
  try {
    const head = await file.slice(0, 256 * 1024).arrayBuffer();
    return parseDateTimeOriginal(head);
  } catch {
    return null;
  }
}

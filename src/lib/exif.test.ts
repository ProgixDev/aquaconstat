import { describe, expect, it } from "vitest";
import { parseDateTimeOriginal } from "./exif";

/**
 * Builds the smallest JPEG that still carries a real EXIF block:
 * SOI · APP1("Exif\0\0" + TIFF) where IFD0 points at an Exif IFD holding
 * DateTimeOriginal. Offsets below are relative to the TIFF header, exactly as
 * the format requires — that indirection is what the parser has to get right.
 */
function jpegWithDate(date: string, { littleEndian = true } = {}): ArrayBuffer {
  const EXIF_IFD_AT = 26;
  const STRING_AT = 44;
  const TIFF_LENGTH = STRING_AT + 20;

  const tiff = new DataView(new ArrayBuffer(TIFF_LENGTH));
  const le = littleEndian;
  tiff.setUint16(0, le ? 0x4949 : 0x4d4d); // "II" / "MM"
  tiff.setUint16(2, 0x002a, le);
  tiff.setUint32(4, 8, le); // IFD0 offset

  tiff.setUint16(8, 1, le); // IFD0: one entry
  tiff.setUint16(10, 0x8769, le); // ExifIFDPointer
  tiff.setUint16(12, 4, le); // type LONG
  tiff.setUint32(14, 1, le); // count
  tiff.setUint32(18, EXIF_IFD_AT, le);
  tiff.setUint32(22, 0, le); // no next IFD

  tiff.setUint16(EXIF_IFD_AT, 1, le); // Exif IFD: one entry
  tiff.setUint16(EXIF_IFD_AT + 2, 0x9003, le); // DateTimeOriginal
  tiff.setUint16(EXIF_IFD_AT + 4, 2, le); // type ASCII
  tiff.setUint32(EXIF_IFD_AT + 6, 20, le); // count (19 chars + NUL)
  tiff.setUint32(EXIF_IFD_AT + 10, STRING_AT, le);
  tiff.setUint32(EXIF_IFD_AT + 14, 0, le); // no next IFD

  for (let i = 0; i < 19; i++) tiff.setUint8(STRING_AT + i, date.charCodeAt(i));
  tiff.setUint8(STRING_AT + 19, 0);

  const out = new DataView(new ArrayBuffer(12 + TIFF_LENGTH));
  out.setUint16(0, 0xffd8); // SOI
  out.setUint16(2, 0xffe1); // APP1
  out.setUint16(4, 2 + 6 + TIFF_LENGTH); // segment size
  for (const [i, code] of [0x45, 0x78, 0x69, 0x66, 0x00, 0x00].entries()) {
    out.setUint8(6 + i, code); // "Exif\0\0"
  }
  new Uint8Array(out.buffer).set(new Uint8Array(tiff.buffer), 12);
  return out.buffer;
}

describe("parseDateTimeOriginal", () => {
  it("reads the capture date from a little-endian JPEG", () => {
    expect(parseDateTimeOriginal(jpegWithDate("2026:07:18 14:23:05"))).toBe("2026-07-18T14:23:05");
  });

  it("reads the capture date from a big-endian JPEG", () => {
    const buffer = jpegWithDate("2026:01:02 03:04:05", { littleEndian: false });
    expect(parseDateTimeOriginal(buffer)).toBe("2026-01-02T03:04:05");
  });

  it("returns null when the file is not a JPEG", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(parseDateTimeOriginal(png.buffer)).toBeNull();
  });

  it("returns null for a JPEG whose EXIF was stripped", () => {
    const bare = new DataView(new ArrayBuffer(8));
    bare.setUint16(0, 0xffd8); // SOI
    bare.setUint16(2, 0xffda); // straight to image data
    bare.setUint16(4, 2);
    expect(parseDateTimeOriginal(bare.buffer)).toBeNull();
  });

  it("returns null rather than throwing on a truncated file", () => {
    const full = jpegWithDate("2026:07:18 14:23:05");
    expect(parseDateTimeOriginal(full.slice(0, 20))).toBeNull();
  });
});

import { describe, expect, it, vi } from "vitest";
import { createFunnelStore } from "./store";

// jsdom has no IndexedDB and no object-URL factory; the store only fires these
// as background persistence, so stubbing them keeps the unit tests on state.
vi.mock("./photo-storage", () => ({
  savePhotos: vi.fn(async () => {}),
  loadPhotos: vi.fn(async () => []),
  deletePhoto: vi.fn(async () => {}),
  clearPhotos: vi.fn(async () => {}),
}));

const blob = (name: string) => new Blob([name], { type: "image/jpeg" });

describe("funnel store", () => {
  it("persists fields across reads (AC-2)", () => {
    const store = createFunnelStore();
    store.getState().setField("prenom", "Camille");
    store.getState().setField("typeLieu", "copro");
    expect(store.getState().data.prenom).toBe("Camille");
    expect(store.getState().data.typeLieu).toBe("copro");
  });

  it("toggles pièces independently (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().togglePiece("sdb");
    expect(store.getState().data.pieces.sdb).toBe(true);
    expect(store.getState().data.pieces.salon).toBe(false);
    store.getState().togglePiece("sdb");
    expect(store.getState().data.pieces.sdb).toBe(false);
  });

  it("gives each checked part its own m² field (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().toggleSurfacePart("sdb", "plaf");
    store.getState().toggleSurfacePart("sdb", "sol");
    store.getState().setPartSurfaceM2("sdb", "plaf", "12");
    store.getState().setPartSurfaceM2("sdb", "sol", "8");
    const sdb = store.getState().data.surfaces.sdb;
    expect(sdb?.parts).toEqual({ plaf: "12", sol: "8" });
    expect("murs" in (sdb?.parts ?? {})).toBe(false);
  });

  it("unchecking a part drops it and its m² (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().toggleSurfacePart("sdb", "plaf");
    store.getState().setPartSurfaceM2("sdb", "plaf", "12");
    store.getState().toggleSurfacePart("sdb", "plaf");
    expect(store.getState().data.surfaces.sdb?.parts).toEqual({});
  });

  it("keeps each room's answers separate (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().toggleSurfacePart("sdb", "plaf");
    store.getState().toggleSurfacePart("couloirWc", "sol");
    store.getState().setPartSurfaceM2("couloirWc", "sol", "8,5");
    expect(store.getState().data.surfaces.sdb?.parts).toEqual({ plaf: "" });
    expect(store.getState().data.surfaces.couloirWc?.parts).toEqual({ sol: "8,5" });
  });

  it("keeps oversized photos as errors and counts only ok ones (AC-4)", () => {
    const store = createFunnelStore();
    store.getState().addPhotos([
      { name: "a.jpg", blob: blob("a"), tooLarge: false, takenAt: "2026-07-18T14:23:05" },
      { name: "b.heic", blob: blob("b"), tooLarge: true, takenAt: null },
    ]);
    const photos = store.getState().photos;
    expect(photos).toHaveLength(2);
    expect(photos.filter((p) => p.status === "ok")).toHaveLength(1);
    store.getState().removePhoto(photos[0]!.id);
    expect(store.getState().photos).toHaveLength(1);
  });

  it("keeps the EXIF capture time alongside each photo (client, 2026-07-18)", () => {
    const store = createFunnelStore();
    store.getState().addPhotos([
      { name: "live.jpg", blob: blob("a"), tooLarge: false, takenAt: "2026-07-18T14:23:05" },
      { name: "stripped.jpg", blob: blob("b"), tooLarge: false, takenAt: null },
    ]);
    const [live, stripped] = store.getState().photos;
    expect(live?.takenAt).toBe("2026-07-18T14:23:05");
    // A photo without readable EXIF must still be accepted, just undated.
    expect(stripped?.takenAt).toBeNull();
    expect(stripped?.status).toBe("ok");
  });

  it("generates a stable AC-2026-NNNN reference on payment (AC-5)", () => {
    const store = createFunnelStore();
    const ref = store.getState().submitPayment();
    expect(ref).toMatch(/^AC-2026-\d{4}$/);
    expect(store.getState().submitPayment()).toBe(ref);
  });
});

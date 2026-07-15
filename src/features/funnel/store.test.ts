import { describe, expect, it } from "vitest";
import { createFunnelStore } from "./store";

describe("funnel store", () => {
  it("persists fields across reads (AC-2)", () => {
    const store = createFunnelStore();
    store.getState().setField("prenom", "Camille");
    store.getState().setField("typeLieu", "copro");
    expect(store.getState().data.prenom).toBe("Camille");
    expect(store.getState().data.typeLieu).toBe("copro");
  });

  it("toggles causes and pieces independently (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().toggleCause("canal");
    store.getState().togglePiece("sdb");
    expect(store.getState().data.causes.canal).toBe(true);
    expect(store.getState().data.causes.gel).toBe(false);
    expect(store.getState().data.pieces.sdb).toBe(true);
    store.getState().toggleCause("canal");
    expect(store.getState().data.causes.canal).toBe(false);
  });

  it("tracks per-room surfaces (AC-3)", () => {
    const store = createFunnelStore();
    store.getState().toggleSurfacePart("sdb", "plaf");
    store.getState().setSurfaceDim("sdb", "longueur", "2,1");
    const sdb = store.getState().data.surfaces.sdb;
    expect(sdb?.plaf).toBe(true);
    expect(sdb?.murs).toBe(false);
    expect(sdb?.longueur).toBe("2,1");
  });

  it("keeps oversized photos as errors and counts only ok ones (AC-4)", () => {
    const store = createFunnelStore();
    store.getState().addPhotos([
      { name: "a.jpg", url: "blob:a", tooLarge: false },
      { name: "b.heic", url: "", tooLarge: true },
    ]);
    const photos = store.getState().photos;
    expect(photos).toHaveLength(2);
    expect(photos.filter((p) => p.status === "ok")).toHaveLength(1);
    store.getState().removePhoto(photos[0]!.id);
    expect(store.getState().photos).toHaveLength(1);
  });

  it("generates a stable AC-2026-NNNN reference on payment (AC-5)", () => {
    const store = createFunnelStore();
    const ref = store.getState().submitPayment();
    expect(ref).toMatch(/^AC-2026-\d{4}$/);
    expect(store.getState().submitPayment()).toBe(ref);
  });
});

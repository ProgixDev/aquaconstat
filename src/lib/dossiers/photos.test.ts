import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  fetchDossierPhotos,
  isPhotoStorageLive,
  signDossierPhotos,
  uploadDossierPhotos,
} from "./photos";
import type { DossierPhoto } from "./types";

// No SUPABASE_SERVICE_ROLE_KEY in the test env ⇒ simulation. These lock in that
// the helper degrades to a no-op instead of reaching for a client that cannot be
// built — the funnel must stay walkable with no cloud.
describe("dossier photos — simulation", () => {
  it("reports storage as offline", () => {
    expect(isPhotoStorageLive).toBe(false);
  });

  it("uploads nothing and persists no photo metadata", async () => {
    const stored = await uploadDossierPhotos("AC-2026-1234", [
      { name: "degat.jpg", takenAt: null, bytes: Buffer.from("x"), contentType: "image/jpeg" },
    ]);
    expect(stored).toEqual([]);
  });

  it("passes a mock path straight through as the URL (keeps the admin grid working)", async () => {
    const photos: DossierPhoto[] = [
      { path: "/mock/dossier/01-vue-generale.jpg", name: "vue générale", takenAt: null },
    ];
    const resolved = await signDossierPhotos(photos);
    expect(resolved).toEqual([{ ...photos[0], url: "/mock/dossier/01-vue-generale.jpg" }]);
  });

  it("has nothing to attach to the operator e-mail", async () => {
    expect(await fetchDossierPhotos([{ path: "p", name: "n", takenAt: null }])).toEqual([]);
  });

  it("returns an empty list for no photos without touching storage", async () => {
    expect(await signDossierPhotos([])).toEqual([]);
  });
});

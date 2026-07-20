import { createJSONStorage, devtools, persist, type StateStorage } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { deletePhoto, savePhotos, type StoredPhoto } from "./photo-storage";
import type { FunnelData, PhotoItem, PieceKey, RoomSurface, SurfacePart } from "./types";

/**
 * Vanilla store factory — the mandatory SSR-safe pattern (docs/conventions/state.md):
 * instantiated per mount by provider.tsx, never as a module-level singleton.
 *
 * The dossier survives a reload: answers go to localStorage, photo blobs to
 * IndexedDB (see photo-storage.ts). A phone routinely kills the tab while the
 * camera app is open, and losing a half-filled dossier at that moment loses
 * the customer. Rehydration is deferred to the provider (`skipHydration`) so
 * the server-rendered markup and the first client render still match.
 * The backend spec (006) will own server-side persistence.
 */

/**
 * localStorage when it is genuinely usable, an in-memory shim otherwise —
 * it is missing on the server, and Safari's private mode *throws* on write
 * rather than reporting it. Saving the dossier is a safety net: it must never
 * be the reason a visitor can't fill the form.
 */
const memory = new Map<string, string>();
const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => void memory.set(name, value),
  removeItem: (name) => void memory.delete(name),
};

function resolveStorage(): StateStorage {
  try {
    if (typeof localStorage === "undefined") return memoryStorage;
    const probe = "__olala_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return memoryStorage;
  }
}

const emptyRoom: RoomSurface = { plaf: false, murs: false, sol: false, surfaceM2: "" };

const initialData: FunnelData = {
  assuranceReclame: true,
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  adresse: "",
  batiment: "",
  etage: "",
  codePostal: "",
  ville: "",
  typeLieu: "",
  syndic: "",
  statut: "",
  dateSinistre: "",
  pieces: {
    salon: false,
    chambre: false,
    cuisine: false,
    sdb: false,
    couloirWc: false,
    partiesCommunes: false,
  },
  surfaces: {},
};

export type FunnelState = {
  data: FunnelData;
  photos: PhotoItem[];
  nextPhotoId: number;
  reference: string | null;
  setField: <K extends keyof FunnelData>(key: K, value: FunnelData[K]) => void;
  togglePiece: (key: PieceKey) => void;
  toggleSurfacePart: (room: PieceKey, part: SurfacePart) => void;
  setRoomSurfaceM2: (room: PieceKey, surfaceM2: string) => void;
  addPhotos: (
    files: { name: string; blob: Blob; tooLarge: boolean; takenAt: string | null }[],
  ) => void;
  /** Restores photos read back from IndexedDB after a reload. */
  hydratePhotos: (photos: PhotoItem[]) => void;
  removePhoto: (id: number) => void;
  retryPhoto: (id: number) => void;
  submitPayment: () => string;
};

export type FunnelStore = ReturnType<typeof createFunnelStore>;

export function createFunnelStore(seed: Partial<FunnelData> = {}) {
  return createStore<FunnelState>()(
    devtools(
      persist(
        (set, get) => ({
          data: { ...initialData, ...seed },
          photos: [],
          nextPhotoId: 1,
          reference: null,
          setField: (key, value) =>
            set((s) => ({ data: { ...s.data, [key]: value } }), undefined, "funnel/setField"),
          togglePiece: (key) =>
            set(
              (s) => ({
                data: { ...s.data, pieces: { ...s.data.pieces, [key]: !s.data.pieces[key] } },
              }),
              undefined,
              "funnel/togglePiece",
            ),
          toggleSurfacePart: (room, part) =>
            set(
              (s) => {
                const current = s.data.surfaces[room] ?? emptyRoom;
                return {
                  data: {
                    ...s.data,
                    surfaces: {
                      ...s.data.surfaces,
                      [room]: { ...current, [part]: !current[part] },
                    },
                  },
                };
              },
              undefined,
              "funnel/toggleSurfacePart",
            ),
          setRoomSurfaceM2: (room, surfaceM2) =>
            set(
              (s) => {
                const current = s.data.surfaces[room] ?? emptyRoom;
                return {
                  data: {
                    ...s.data,
                    surfaces: { ...s.data.surfaces, [room]: { ...current, surfaceM2 } },
                  },
                };
              },
              undefined,
              "funnel/setRoomSurfaceM2",
            ),
          // Not a `set` updater: minting object URLs and writing to IndexedDB are
          // side effects, and an updater must stay pure (React may re-run it).
          addPhotos: (files) => {
            let id = get().nextPhotoId;
            const records: StoredPhoto[] = [];
            const added = files.map((f): PhotoItem => {
              const item: PhotoItem = {
                id: id++,
                name: f.name,
                url: f.tooLarge ? "" : URL.createObjectURL(f.blob),
                status: f.tooLarge ? "error" : "ok",
                takenAt: f.takenAt,
              };
              records.push({
                id: item.id,
                name: item.name,
                status: item.status,
                takenAt: item.takenAt,
                blob: f.tooLarge ? null : f.blob,
              });
              return item;
            });
            set(
              (s) => ({ photos: [...s.photos, ...added], nextPhotoId: id }),
              undefined,
              "funnel/addPhotos",
            );
            void savePhotos(records);
          },
          hydratePhotos: (photos) =>
            set(
              (s) => ({
                photos,
                nextPhotoId: Math.max(s.nextPhotoId, ...photos.map((p) => p.id + 1)),
              }),
              undefined,
              "funnel/hydratePhotos",
            ),
          removePhoto: (id) => {
            set(
              (s) => ({ photos: s.photos.filter((p) => p.id !== id) }),
              undefined,
              "funnel/removePhoto",
            );
            void deletePhoto(id);
          },
          retryPhoto: (id) => {
            set(
              (s) => ({ photos: s.photos.filter((p) => p.id !== id) }),
              undefined,
              "funnel/retryPhoto",
            );
            void deletePhoto(id);
          },
          submitPayment: () => {
            const existing = get().reference;
            if (existing) return existing;
            const reference = `AC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
            set({ reference }, undefined, "funnel/submitPayment");
            return reference;
          },
        }),
        {
          name: "olala-funnel",
          storage: createJSONStorage(resolveStorage),
          // Rehydrated by the provider in an effect: reading localStorage
          // during render would make the client markup diverge from the SSR
          // output and blow up hydration.
          skipHydration: true,
          // Photos are deliberately absent — Blobs aren't JSON, and their
          // `blob:` URLs are dead after a reload. IndexedDB owns them.
          partialize: (s) => ({ data: s.data, reference: s.reference, nextPhotoId: s.nextPhotoId }),
        },
      ),
      { name: "funnel" },
    ),
  );
}

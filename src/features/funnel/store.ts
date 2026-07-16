import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { FunnelData, PhotoItem, PieceKey, RoomSurface, SurfacePart, Taille } from "./types";

/**
 * Vanilla store factory — the mandatory SSR-safe pattern (docs/conventions/state.md):
 * instantiated per mount by provider.tsx, never as a module-level singleton.
 * Holds the whole funnel in memory; the backend spec will own persistence.
 */

const emptyRoom: RoomSurface = { plaf: false, murs: false, sol: false, taille: "" };

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
  setRoomTaille: (room: PieceKey, taille: Taille) => void;
  addPhotos: (files: { name: string; url: string; tooLarge: boolean }[]) => void;
  removePhoto: (id: number) => void;
  retryPhoto: (id: number) => void;
  submitPayment: () => string;
};

export type FunnelStore = ReturnType<typeof createFunnelStore>;

export function createFunnelStore(seed: Partial<FunnelData> = {}) {
  return createStore<FunnelState>()(
    devtools(
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
        setRoomTaille: (room, taille) =>
          set(
            (s) => {
              const current = s.data.surfaces[room] ?? emptyRoom;
              return {
                data: {
                  ...s.data,
                  surfaces: { ...s.data.surfaces, [room]: { ...current, taille } },
                },
              };
            },
            undefined,
            "funnel/setRoomTaille",
          ),
        addPhotos: (files) =>
          set(
            (s) => {
              let id = s.nextPhotoId;
              const added = files.map(
                (f): PhotoItem => ({
                  id: id++,
                  name: f.name,
                  url: f.url,
                  status: f.tooLarge ? "error" : "ok",
                }),
              );
              return { photos: [...s.photos, ...added], nextPhotoId: id };
            },
            undefined,
            "funnel/addPhotos",
          ),
        removePhoto: (id) =>
          set(
            (s) => ({ photos: s.photos.filter((p) => p.id !== id) }),
            undefined,
            "funnel/removePhoto",
          ),
        retryPhoto: (id) =>
          set(
            (s) => ({ photos: s.photos.filter((p) => p.id !== id) }),
            undefined,
            "funnel/retryPhoto",
          ),
        submitPayment: () => {
          const existing = get().reference;
          if (existing) return existing;
          const reference = `AC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
          set({ reference }, undefined, "funnel/submitPayment");
          return reference;
        },
      }),
      { name: "funnel" },
    ),
  );
}

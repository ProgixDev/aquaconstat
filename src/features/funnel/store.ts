import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type {
  EtatKey,
  Etat,
  FunnelData,
  InfilKey,
  PhotoItem,
  PieceKey,
  RoomSurface,
  SurfacePart,
} from "./types";

/**
 * Vanilla store factory — the mandatory SSR-safe pattern (docs/conventions/state.md):
 * instantiated per mount by provider.tsx, never as a module-level singleton.
 * Holds the whole funnel in memory; the backend spec will own persistence.
 */

const emptyRoom: RoomSurface = { murs: false, plaf: false, sols: false, longueur: "", largeur: "" };

const initialData: FunnelData = {
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
  moins10Ans: "",
  usageHabitation: "",
  syndic: "",
  statut: "",
  proprietaire: "",
  resiliationBail: "",
  locationMeublee: "",
  occupant: "",
  assureur: "",
  numeroContrat: "",
  numeroSinistre: "",
  agent: "",
  adresseAssureur: "",
  dateSinistre: "",
  rechercheFuite: "",
  rechercheFuitePar: "",
  causeIdentifiee: "",
  causeReparee: "",
  origine: "",
  originePrecision: "",
  causes: {
    canal: false,
    appareil: false,
    cheneaux: false,
    infil: false,
    gel: false,
    autre: false,
  },
  canalType: "",
  canalFlux: "",
  canalAcces: "",
  infiltrations: { toiture: false, terrasse: false, facade: false, fenetre: false, joint: false },
  autreCause: "",
  tiersResponsable: "",
  tiersPourquoi: "",
  tiersNom: "",
  pieces: {
    sdb: false,
    cuisine: false,
    salon: false,
    chambre: false,
    couloir: false,
    wc: false,
    autre: false,
  },
  surfaces: {},
  etats: { peintures: "", revetements: "", plinthes: "", parquet: "" },
  humidite: "",
  precisions: "",
};

export type FunnelState = {
  data: FunnelData;
  photos: PhotoItem[];
  nextPhotoId: number;
  reference: string | null;
  setField: <K extends keyof FunnelData>(key: K, value: FunnelData[K]) => void;
  toggleCause: (key: keyof FunnelData["causes"]) => void;
  toggleInfiltration: (key: InfilKey) => void;
  togglePiece: (key: PieceKey) => void;
  toggleSurfacePart: (room: PieceKey, part: SurfacePart) => void;
  setSurfaceDim: (room: PieceKey, dim: "longueur" | "largeur", value: string) => void;
  setEtat: (key: EtatKey, value: Etat) => void;
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
        toggleCause: (key) =>
          set(
            (s) => ({
              data: { ...s.data, causes: { ...s.data.causes, [key]: !s.data.causes[key] } },
            }),
            undefined,
            "funnel/toggleCause",
          ),
        toggleInfiltration: (key) =>
          set(
            (s) => ({
              data: {
                ...s.data,
                infiltrations: { ...s.data.infiltrations, [key]: !s.data.infiltrations[key] },
              },
            }),
            undefined,
            "funnel/toggleInfiltration",
          ),
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
        setSurfaceDim: (room, dim, value) =>
          set(
            (s) => {
              const current = s.data.surfaces[room] ?? emptyRoom;
              return {
                data: {
                  ...s.data,
                  surfaces: { ...s.data.surfaces, [room]: { ...current, [dim]: value } },
                },
              };
            },
            undefined,
            "funnel/setSurfaceDim",
          ),
        setEtat: (key, value) =>
          set(
            (s) => ({ data: { ...s.data, etats: { ...s.data.etats, [key]: value } } }),
            undefined,
            "funnel/setEtat",
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

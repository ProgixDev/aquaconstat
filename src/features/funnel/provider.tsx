"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import { loadPhotos } from "./photo-storage";
import { createFunnelStore, type FunnelState, type FunnelStore } from "./store";
import type { PhotoItem } from "./types";

const FunnelStoreContext = createContext<FunnelStore | null>(null);

type FunnelStoreProviderProps = {
  children: React.ReactNode;
};

/**
 * One store per mounted provider — lives in the (funnel) layout so it survives
 * step navigation.
 *
 * On mount it restores an interrupted dossier: answers from localStorage, then
 * photos from IndexedDB with fresh object URLs (the stored `blob:` URLs died
 * with the previous document). Both run in an effect, never during render, so
 * hydration still matches the server markup.
 */
export function FunnelStoreProvider({ children }: FunnelStoreProviderProps) {
  const [store] = useState<FunnelStore>(() => createFunnelStore());

  useEffect(() => {
    void store.persist.rehydrate();

    let urls: string[] = [];
    let cancelled = false;
    void loadPhotos().then((records) => {
      if (cancelled || records.length === 0) return;
      const photos: PhotoItem[] = records.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        takenAt: r.takenAt,
        url: r.blob ? URL.createObjectURL(r.blob) : "",
      }));
      urls = photos.map((p) => p.url).filter(Boolean);
      store.getState().hydratePhotos(photos);
    });

    return () => {
      cancelled = true;
      // Only the URLs minted here — the ones the store made for live captures
      // stay valid for as long as the document does.
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [store]);

  return <FunnelStoreContext.Provider value={store}>{children}</FunnelStoreContext.Provider>;
}

/** Always subscribe through a selector — whole-store subscriptions fail review. */
export function useFunnelStore<T>(selector: (state: FunnelState) => T): T {
  const store = useContext(FunnelStoreContext);
  if (!store) {
    throw new Error("useFunnelStore must be used within a FunnelStoreProvider.");
  }
  return useStore(store, selector);
}

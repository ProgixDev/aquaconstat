"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { createFunnelStore, type FunnelState, type FunnelStore } from "./store";

const FunnelStoreContext = createContext<FunnelStore | null>(null);

type FunnelStoreProviderProps = {
  children: React.ReactNode;
};

/** One store per mounted provider — lives in the (funnel) layout so it survives step navigation. */
export function FunnelStoreProvider({ children }: FunnelStoreProviderProps) {
  const [store] = useState<FunnelStore>(() => createFunnelStore());
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

import { FunnelChrome, FunnelStoreProvider } from "@/features/funnel";

/** Funnel segment — one store for all steps, minimal chrome (spec 003). */
export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <FunnelStoreProvider>
      <FunnelChrome>{children}</FunnelChrome>
    </FunnelStoreProvider>
  );
}

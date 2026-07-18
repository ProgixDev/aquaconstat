import { FunnelChrome, FunnelStoreProvider } from "@/features/funnel";
import { SiteFooter, SiteHeader } from "@/features/landing";

/**
 * Funnel segment — one store for all steps. The site's own header and footer
 * frame the funnel (client, 2026-07-18): the visitor never leaves the Ôlala
 * world, and the dock's links stay one tap away. Composed here at the app
 * layer — features never import each other.
 */
export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <FunnelStoreProvider>
      {/* Static (not fixed): a floating dock kept sliding over the stepper and
          the form while scrolling — in the flow it can never cover anything.
          Passed as the chrome's header slot so it sits on the same gradient
          ground as the form. */}
      <FunnelChrome header={<SiteHeader docked={false} />}>{children}</FunnelChrome>
      <SiteFooter />
    </FunnelStoreProvider>
  );
}

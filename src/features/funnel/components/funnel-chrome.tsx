import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

type FunnelChromeProps = {
  children: React.ReactNode;
};

/** Minimal funnel shell — logo header, content, one-line footer. */
export function FunnelChrome({ children }: FunnelChromeProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-5 px-5 pt-6 md:px-14">
        <Link href="/" aria-label="AquaConstat — accueil">
          <BrandLogo />
        </Link>
        <div className="text-muted-foreground text-xs">Paiement sécurisé Stripe</div>
      </header>
      {children}
      <footer className="text-hint p-5 text-center text-xs">
        AquaConstat — devis dégât des eaux à distance ·{" "}
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Accueil
        </Link>
      </footer>
    </div>
  );
}

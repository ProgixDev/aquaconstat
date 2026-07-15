import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

type FunnelChromeProps = {
  children: React.ReactNode;
};

/** Minimal funnel shell — logo header, content, one-line footer. */
export function FunnelChrome({ children }: FunnelChromeProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-5 px-5 pt-6 md:px-14">
        <Link href="/" className="flex items-center gap-2.5">
          <DropletGlyph size="lg" />
          <span className="font-display text-foreground text-sm font-bold tracking-widest">
            AQUACONSTAT
          </span>
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

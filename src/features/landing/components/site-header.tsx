import Link from "next/link";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

/** Minimal sticky bar — logo, anchor nav, primary CTA. */
export function SiteHeader() {
  return (
    <header className="bg-background/85 border-border-soft sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <DropletGlyph size="lg" />
          <span className="font-display text-foreground text-base font-bold tracking-widest">
            AQUACONSTAT
          </span>
        </Link>
        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          <a href="#comment-ca-marche" className="hover:text-foreground">
            Comment ça marche
          </a>
          <a href="#tarif" className="hover:text-foreground">
            Tarif
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
        <CtaButton href="/dossier" size="sm">
          Démarrer mon dossier
        </CtaButton>
      </div>
    </header>
  );
}

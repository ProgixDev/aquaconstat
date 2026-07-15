import Link from "next/link";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "./droplet-glyph";

/** Pill header — logo, anchor nav, primary CTA. */
export function SiteHeader() {
  return (
    <header className="bg-card shadow-card flex items-center justify-between gap-5 rounded-xl px-5 py-3.5">
      <Link href="/" className="flex items-center gap-2.5">
        <DropletGlyph size="lg" />
        <span className="font-display text-foreground text-base font-bold tracking-widest">
          AQUACONSTAT
        </span>
      </Link>
      <nav className="text-muted-foreground hidden items-center gap-7 text-sm md:flex">
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
    </header>
  );
}

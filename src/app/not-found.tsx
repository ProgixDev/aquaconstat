import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

/** 404 per design/prototype/erreur-404.dc.html. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <DropletGlyph size="lg" inactive className="size-4" />
      <div className="font-display text-ink-soft mt-6 text-7xl tracking-wider md:text-8xl">404</div>
      <p className="text-steel mt-2.5 max-w-sm text-base leading-relaxed">
        Cette page n’existe pas — retour à l’accueil.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground shadow-cta-sm mt-6 inline-block rounded-full px-7 py-3.5 text-sm font-semibold"
      >
        Retour à l’accueil
      </Link>
      <div className="mt-10 flex items-center gap-2.5 opacity-70">
        <DropletGlyph size="md" />
        <span className="font-display text-muted-foreground text-xs font-bold tracking-widest">
          ÔLALA
        </span>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

/** Route error boundary — 500 per design/prototype/erreur-500.dc.html. */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <DropletGlyph size="lg" inactive className="size-4" />
      <div className="font-display text-ink-soft mt-6 text-7xl tracking-wider md:text-8xl">500</div>
      <p className="text-steel mt-2.5 max-w-md text-base leading-relaxed">
        Une erreur est survenue — vos données ne sont pas perdues, réessayez.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3.5">
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground shadow-cta-sm cursor-pointer rounded-full px-7 py-3.5 font-sans text-sm font-semibold"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="border-input bg-card text-ink-soft inline-block rounded-full border px-7 py-3.5 text-sm font-semibold"
        >
          Retour à l’accueil
        </Link>
      </div>
      <div className="mt-10 flex items-center gap-2.5 opacity-70">
        <DropletGlyph size="md" />
        <span className="font-display text-muted-foreground text-xs font-bold tracking-widest">
          AQUACONSTAT
        </span>
      </div>
    </main>
  );
}

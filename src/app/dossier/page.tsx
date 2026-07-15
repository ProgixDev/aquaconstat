import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Démarrer mon dossier",
};

/**
 * Painted-door stub for the funnel entry (spec 002, AC-3). The real dossier
 * flow (design/prototype/etape-1-dossier.dc.html) ships with spec 003.
 */
export default function DossierPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">Démarrer mon dossier</h1>
      <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
        Le dépôt de dossier en ligne ouvre très bientôt. En attendant, écrivez-nous à
        contact@aquaconstat.fr — nous vous préviendrons dès l’ouverture.
      </p>
      <Link href="/" className="text-link hover:text-link-hover text-sm font-semibold">
        ← Retour à l’accueil
      </Link>
    </main>
  );
}

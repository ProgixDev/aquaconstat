import type { Metadata } from "next";
import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { LoginForm } from "@/features/admin";

export const metadata: Metadata = {
  title: "Connexion — Administration",
  robots: { index: false, follow: false },
};

export default function AdminConnexionPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2.5">
        <DropletGlyph size="lg" />
        <span className="font-display text-foreground text-sm font-bold tracking-widest">
          AQUACONSTAT
        </span>
      </div>
      <LoginForm />
      <div className="text-hint mt-4.5 text-xs">
        Accès réservé · un problème de connexion ?{" "}
        <Link href="/admin/connexion" className="text-muted-foreground underline">
          Contacter Progix
        </Link>
      </div>
    </main>
  );
}

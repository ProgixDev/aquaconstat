import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";

/** Utilitarian admin bar — brand, section pill, sign-out. */
export function AdminHeader() {
  return (
    <header className="border-border-faint bg-card flex items-center justify-between gap-5 border-b px-5 py-5 md:px-12">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <DropletGlyph size="lg" />
          <span className="font-display text-foreground text-sm font-bold tracking-widest">
            AQUACONSTAT
          </span>
        </Link>
        <span className="border-input text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-semibold tracking-widest uppercase">
          Administration
        </span>
      </div>
      <Link href="/admin/connexion" className="text-muted-foreground hover:text-foreground text-sm">
        Déconnexion
      </Link>
    </header>
  );
}

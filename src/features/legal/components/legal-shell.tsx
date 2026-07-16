import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/**
 * Minimal chrome for the legal pages (spec 005). The landing header/footer
 * carry in-page anchors (#tarif…) that are dead off the landing, and a
 * visitor reading the CGV mid-paiement needs a quiet document, not marketing
 * chrome — so these pages get their own: logo home-link, back link, and a
 * footer that cross-links the three documents (AC-4, AC-5).
 */
export function LegalChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex min-h-dvh flex-col">
      <header className="border-border-faint bg-card border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="Ôlala — accueil">
            <BrandLogo />
          </Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
            ← Retour à l’accueil
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-border-faint bg-card mt-auto border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6 text-xs">
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground">
              Politique de confidentialité
            </Link>
            <Link href="/cgv" className="hover:text-foreground">
              CGV
            </Link>
          </nav>
          <span>© 2026 Ôlala</span>
        </div>
      </footer>
    </div>
  );
}

type LegalShellProps = {
  title: string;
  /** e.g. « Version du 16 juillet 2026 » — a legal document dates itself. */
  version: string;
  children: React.ReactNode;
};

/** Single-column document body: title, version line, then the sections. */
export function LegalShell({ title, version, children }: LegalShellProps) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="text-hint mt-2 text-sm">{version}</p>
      <div className="mt-9 flex flex-col gap-9">{children}</div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="text-ink-soft mt-3 flex flex-col gap-3 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/** Label/value block for identity facts (éditeur, hébergeur, prestataire). */
export function FactList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="border-border-faint bg-card grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-4 gap-y-2.5 rounded-lg border px-5 py-4.5">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-hint">{row.label}</dt>
          <dd className="break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bulleted list with the droplet-adjacent square marker used across the site. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden className="bg-aqua mt-1.75 size-1.5 flex-none rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

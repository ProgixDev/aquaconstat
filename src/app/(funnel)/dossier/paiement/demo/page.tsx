import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSimulationAllowed } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Paiement (démonstration)",
  robots: { index: false, follow: false },
};

/**
 * Stand-in for Stripe's hosted checkout, used only while no `STRIPE_SECRET_KEY`
 * is configured (see src/lib/payments.ts). It looks like a payment step but
 * charges nothing: « Payer » forwards to /confirmation with the demo session
 * id (`demo_<token>`), « Annuler » returns to the funnel. With a real key this
 * page is never reached — checkout opens on Stripe instead.
 */
export default async function DemoCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  // Never exists in production unless deliberately re-opened for staging: this
  // page marks a dossier paid without charging anything.
  if (!isSimulationAllowed) notFound();

  const { s } = await searchParams;
  if (!s) redirect("/dossier/paiement");

  return (
    <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-md flex-1 px-6 py-10 md:px-10">
      <div className="border-primary/40 bg-primary/10 text-ink-soft mb-6 rounded-md border px-4 py-3 text-center text-xs font-semibold">
        Mode démonstration — aucun paiement réel n’est effectué.
      </div>

      <div className="text-hint text-xs font-semibold tracking-widest uppercase">Paiement</div>
      <h1 className="font-display mt-1 text-2xl font-bold">Ôlala</h1>

      <div className="border-border-faint mt-6 flex items-center justify-between gap-4 border-y py-4">
        <span className="text-steel text-sm">Étude du dossier &amp; devis détaillé</span>
        <span className="font-display text-lg font-bold">82,90 € TTC</span>
      </div>

      {/* A disabled card field for realism — the demo needs no real input. */}
      <div className="border-input bg-field text-hint mt-6 rounded-md border px-3.5 py-3 font-mono text-sm">
        4242 4242 4242 4242
      </div>

      <Link
        href={`/confirmation?session_id=demo_${encodeURIComponent(s)}`}
        className="bg-primary text-primary-foreground shadow-cta-sm mt-5 flex w-full justify-center rounded-full px-8 py-4 text-base font-semibold"
      >
        Payer 82,90 € (simulation)
      </Link>
      <Link
        href="/dossier/paiement?canceled=1"
        className="text-muted-foreground hover:text-foreground mt-4 flex justify-center text-sm font-semibold"
      >
        Annuler et revenir au dossier
      </Link>
    </main>
  );
}

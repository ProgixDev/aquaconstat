import type { Metadata } from "next";
import { DossiersTable, OverviewBand, getDossiers } from "@/features/admin";

export const metadata: Metadata = {
  title: "Dossiers reçus — Administration",
  robots: { index: false, follow: false },
};

export default async function AdminDossiersPage() {
  // readAt comes from the data layer, so the first client render computes the
  // same countdowns the server did.
  const { dossiers, readAt } = await getDossiers();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-9 pb-16 md:px-12">
      <h1 className="font-display text-2xl font-bold">Dossiers reçus</h1>
      <p className="text-steel mt-1.5 text-sm">
        Le devis est promis sous 48 h ouvrées à partir du paiement.
      </p>
      <OverviewBand dossiers={dossiers} now={readAt} />
      <DossiersTable dossiers={dossiers} now={readAt} />
    </main>
  );
}

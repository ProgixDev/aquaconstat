import type { Metadata } from "next";
import { Suspense } from "react";
import { PaiementForm, StepShell } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Étape 4 · Récapitulatif et paiement",
};

export default function PaiementPage() {
  return (
    <StepShell step={4}>
      {/* PaiementForm reads ?canceled via useSearchParams — Suspense keeps the
          page out of the static-prerender CSR bailout. */}
      <Suspense>
        <PaiementForm />
      </Suspense>
    </StepShell>
  );
}

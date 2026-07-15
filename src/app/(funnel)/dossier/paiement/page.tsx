import type { Metadata } from "next";
import { PaiementForm, StepShell } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Étape 4 · Récapitulatif et paiement",
};

export default function PaiementPage() {
  return (
    <StepShell step={4}>
      <PaiementForm />
    </StepShell>
  );
}

import type { Metadata } from "next";
import { DossierForm, StepShell } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Étape 1 · Création du dossier",
};

export default function DossierPage() {
  return (
    <StepShell step={1}>
      <DossierForm />
    </StepShell>
  );
}

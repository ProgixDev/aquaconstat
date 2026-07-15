import type { Metadata } from "next";
import { PhotosForm, StepShell } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Étape 3 · Photos",
};

export default function PhotosPage() {
  return (
    <StepShell step={3}>
      <PhotosForm />
    </StepShell>
  );
}

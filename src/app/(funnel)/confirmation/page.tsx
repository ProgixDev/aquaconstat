import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationContent } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Dossier envoyé",
};

export default function ConfirmationPage() {
  return (
    // ConfirmationContent reads ?session_id via useSearchParams.
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

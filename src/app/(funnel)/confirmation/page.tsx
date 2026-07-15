import type { Metadata } from "next";
import { ConfirmationContent } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Dossier envoyé",
};

export default function ConfirmationPage() {
  return <ConfirmationContent />;
}

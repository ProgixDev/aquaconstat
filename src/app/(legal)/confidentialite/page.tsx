import type { Metadata } from "next";
import { Confidentialite } from "@/features/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return <Confidentialite />;
}

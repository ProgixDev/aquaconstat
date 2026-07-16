import type { Metadata } from "next";
import { Cgv } from "@/features/legal";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
};

export default function CgvPage() {
  return <Cgv />;
}

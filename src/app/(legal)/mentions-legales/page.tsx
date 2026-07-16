import type { Metadata } from "next";
import { MentionsLegales } from "@/features/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return <MentionsLegales />;
}

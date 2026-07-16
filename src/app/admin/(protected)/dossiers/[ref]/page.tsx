import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DossierDetail, getDossier } from "@/features/admin";

type PageProps = {
  params: Promise<{ ref: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ref } = await params;
  // Gated inside getDossier — metadata runs outside the layout, so without
  // that this would leak a customer's name into the tab title unauthenticated.
  const { dossier } = await getDossier(decodeURIComponent(ref));
  return {
    title: dossier ? `${dossier.ref} · ${dossier.nom} — Administration` : "Dossier introuvable",
    robots: { index: false, follow: false },
  };
}

export default async function AdminDossierDetailPage({ params }: PageProps) {
  const { ref } = await params;
  const { dossier, readAt } = await getDossier(decodeURIComponent(ref));
  if (!dossier) notFound();

  return <DossierDetail dossier={dossier} now={readAt} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminHeader, DossierDetail, getDossier } from "@/features/admin";

type PageProps = {
  params: Promise<{ ref: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ref } = await params;
  const dossier = getDossier(decodeURIComponent(ref));
  return {
    title: dossier ? `${dossier.ref} · ${dossier.nom} — Administration` : "Dossier introuvable",
    robots: { index: false, follow: false },
  };
}

export default async function AdminDossierDetailPage({ params }: PageProps) {
  const { ref } = await params;
  const dossier = getDossier(decodeURIComponent(ref));
  if (!dossier) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader />
      <DossierDetail dossier={dossier} />
    </div>
  );
}

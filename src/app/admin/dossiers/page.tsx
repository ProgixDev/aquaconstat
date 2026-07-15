import type { Metadata } from "next";
import { AdminHeader, DossiersTable } from "@/features/admin";

export const metadata: Metadata = {
  title: "Dossiers reçus — Administration",
  robots: { index: false, follow: false },
};

export default function AdminDossiersPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-9 pb-16 md:px-12">
        <h1 className="font-display text-2xl font-bold">Dossiers reçus</h1>
        <DossiersTable />
      </main>
    </div>
  );
}

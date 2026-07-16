import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SeaBackdrop } from "@/components/ui/sea-backdrop";
import { LoginForm } from "@/features/admin";

export const metadata: Metadata = {
  title: "Connexion — Administration",
  robots: { index: false, follow: false },
};

export default function AdminConnexionPage() {
  return (
    <main className="bg-navy relative flex min-h-dvh flex-col items-center justify-center p-6">
      <SeaBackdrop priority />
      <div className="relative flex w-full max-w-sm flex-col items-center">
        <BrandLogo variant="dark" />
        {/* LoginForm reads ?next= via useSearchParams, which opts the subtree
            into client rendering and needs a boundary above it. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

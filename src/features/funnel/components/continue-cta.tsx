import Link from "next/link";

type ContinueCtaProps = {
  href: string;
  children: React.ReactNode;
};

/** Full-width yellow step CTA with the reassurance line under it. */
export function ContinueCta({ href, children }: ContinueCtaProps) {
  return (
    <div className="mt-12">
      <Link
        href={href}
        className="bg-primary text-primary-foreground shadow-cta-sm flex justify-center rounded-full px-8 py-4.5 text-base font-semibold"
      >
        {children}
      </Link>
      <div className="text-muted-foreground mt-3.5 text-center text-xs">
        Paiement sécurisé par Stripe · Devis envoyé sous 48 h ouvrées
      </div>
    </div>
  );
}

import Link from "next/link";
import { formatMissing } from "../validation";

type ContinueCtaProps = {
  href: string;
  children: React.ReactNode;
  /** What the step still needs. Non-empty blocks the CTA and says why. */
  missing?: string[];
};

/**
 * Full-width yellow step CTA with the reassurance line under it.
 *
 * When the step is incomplete it renders a real disabled button rather than a
 * link — a styled-but-clickable link would still navigate, which is exactly
 * how an empty dossier used to reach the payment page. The reason is spelled
 * out underneath and announced politely to screen readers.
 */
export function ContinueCta({ href, children, missing = [] }: ContinueCtaProps) {
  const blocked = missing.length > 0;

  return (
    <div className="mt-12">
      {blocked ? (
        <button
          type="button"
          disabled
          className="bg-field text-hint border-border-faint flex w-full cursor-not-allowed justify-center rounded-full border px-8 py-4.5 text-base font-semibold"
        >
          {children}
        </button>
      ) : (
        <Link
          href={href}
          className="bg-primary text-primary-foreground shadow-cta-sm flex justify-center rounded-full px-8 py-4.5 text-base font-semibold"
        >
          {children}
        </Link>
      )}

      {blocked ? (
        <p role="status" className="text-steel mt-3.5 text-center text-sm">
          Pour continuer, indiquez {formatMissing(missing)}.
        </p>
      ) : null}

      <div className="text-muted-foreground mt-3.5 text-center text-xs">
        Paiement sécurisé par Stripe · Devis envoyé sous 48 h ouvrées
      </div>
    </div>
  );
}

import { CtaButton } from "./cta-button";

/** Final navy CTA band — « Votre assurance attend un devis ? ». */
export function FinalCtaSection() {
  return (
    <section className="bg-navy-cta rounded-panel relative overflow-hidden px-6 py-11 text-center md:px-14 md:py-18">
      <div
        aria-hidden
        className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-x-0 -bottom-3.5 text-7xl font-bold whitespace-nowrap italic md:text-9xl"
      >
        10 minutes
      </div>
      <h2 className="font-display text-secondary-foreground relative mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
        Votre assurance attend un devis ?
      </h2>
      <p className="font-display text-primary relative mt-3 text-lg font-bold italic md:text-2xl">
        Il vous faut 10 minutes.
      </p>
      <div className="relative mt-7">
        <CtaButton href="/dossier" size="lg">
          Démarrer mon dossier
        </CtaButton>
      </div>
      <div className="text-aqua-pale/85 relative mt-3 text-xs">
        149 € · paiement sécurisé Stripe · sans création de compte
      </div>
    </section>
  );
}

import { CtaButton } from "./cta-button";

/** Final navy CTA band — « Votre assurance attend un devis ? ». */
export function FinalCtaSection() {
  return (
    <section className="bg-navy-cta relative overflow-hidden">
      <div
        aria-hidden
        className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-x-0 -bottom-6 text-center text-8xl font-bold whitespace-nowrap italic md:text-[10rem]"
      >
        10 minutes
      </div>
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <h2 className="font-display text-secondary-foreground mx-auto text-3xl leading-snug font-bold md:text-5xl">
          Votre assurance attend un devis ?
        </h2>
        <p className="font-display text-primary relative mt-4 text-xl font-bold italic md:text-2xl">
          Il vous faut 10 minutes.
        </p>
        <div className="mt-9">
          <CtaButton href="/dossier" size="lg">
            Démarrer mon dossier
          </CtaButton>
        </div>
        <div className="text-aqua-pale/85 mt-4 text-xs">
          149 € · paiement sécurisé Stripe · sans création de compte
        </div>
      </div>
    </section>
  );
}

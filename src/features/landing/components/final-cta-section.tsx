import Image from "next/image";
import { CtaButton } from "./cta-button";

/** Final CTA — compact water-surface band bookending the hero. */
export function FinalCtaSection() {
  return (
    <section className="bg-navy-cta relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=70"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="from-navy/85 via-navy/40 to-navy/90 absolute inset-0 bg-linear-180" />
      </div>
      <div
        aria-hidden
        className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-0 flex items-center justify-center text-8xl font-bold whitespace-nowrap italic md:text-[9rem]"
      >
        10 minutes
      </div>
      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <h2 className="font-display text-secondary-foreground mx-auto text-3xl leading-snug font-bold md:text-4xl">
          Votre assurance attend un devis ?
        </h2>
        <p className="font-display text-primary mt-3 text-xl font-bold italic md:text-2xl">
          Il vous faut 10 minutes.
        </p>
        <div className="mt-8">
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

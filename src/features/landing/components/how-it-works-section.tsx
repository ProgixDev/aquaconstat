import Link from "next/link";
import { SectionBadge } from "./section-badge";

const steps = [
  {
    title: "Créez votre dossier",
    text: "Vos coordonnées et l’adresse du bien concerné. 2 minutes.",
    meta: "2 min",
  },
  {
    title: "Décrivez le sinistre",
    text: "Un questionnaire guidé : pièces touchées, surfaces, état des murs, plafonds et sols.",
    meta: "≈ 5 min",
  },
  {
    title: "Ajoutez vos photos",
    text: "Depuis la galerie ou l’appareil photo, en suivant nos consignes de prise de vue.",
    meta: "4 à 8 photos",
  },
  {
    title: "Payez en ligne",
    text: "149 € par carte bancaire, dans l’environnement sécurisé de Stripe.",
    meta: "149 € TTC",
  },
  {
    title: "Recevez votre devis",
    text: "Un devis détaillé, préparé par un professionnel, envoyé par e-mail sous 48 h ouvrées.",
    meta: "PDF par e-mail",
  },
] as const;

/** « Comment ça marche » — editorial numbered list with oversized serif numerals. */
export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="bg-card scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <SectionBadge>Comment ça marche</SectionBadge>
            <h2 className="font-display mt-5 text-3xl leading-snug font-bold md:text-4xl">
              Dix minutes, cinq étapes, un devis.
            </h2>
          </div>
          <div className="text-muted-foreground max-w-2xs text-sm">
            Votre dossier n’est transmis qu’une fois le paiement confirmé.
          </div>
        </div>
        <ol className="divide-border-soft border-border-soft mt-12 divide-y border-t">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="grid items-baseline gap-x-8 gap-y-2 py-7 md:grid-cols-[5rem_1fr_8rem]"
            >
              <span
                aria-hidden
                className="font-display text-aqua text-4xl font-bold italic md:text-5xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="text-lg font-semibold md:text-xl">
                  {i === 0 ? (
                    <Link href="/dossier" className="hover:text-link">
                      {step.title} <span aria-hidden>↗</span>
                    </Link>
                  ) : (
                    step.title
                  )}
                </div>
                <p className="text-muted-foreground mt-1.5 max-w-xl text-sm leading-relaxed md:text-base">
                  {step.text}
                </p>
              </div>
              <span className="text-hint tracking-eyebrow text-xs font-semibold uppercase md:justify-self-end">
                {step.meta}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

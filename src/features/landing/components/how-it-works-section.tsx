import Link from "next/link";
import { SectionBadge } from "./section-badge";

const steps = [
  {
    title: "Créez votre dossier",
    text: "Vos coordonnées et l’adresse du bien concerné. 2 minutes.",
    meta: null,
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

/** « Comment ça marche » — five numbered steps. */
export function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-card rounded-panel shadow-panel scroll-mt-6 p-7 md:p-12"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-7 gap-y-4">
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-4">
          <SectionBadge>Comment ça marche</SectionBadge>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Dix minutes, cinq étapes, un devis.
          </h2>
        </div>
        <div className="text-muted-foreground text-sm">
          Votre dossier n’est transmis qu’une fois le paiement confirmé.
        </div>
      </div>
      <ol className="mt-6 flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="bg-muted flex flex-wrap items-center gap-4.5 rounded-lg px-5 py-4"
          >
            <span className="bg-secondary text-secondary-foreground flex size-10 flex-none items-center justify-center rounded-full text-sm font-semibold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-56 flex-1">
              <div className="text-base font-semibold">{step.title}</div>
              <div className="text-muted-foreground mt-0.5 text-sm">{step.text}</div>
            </div>
            {i === 0 ? (
              <Link
                href="/dossier"
                aria-label="Créer votre dossier"
                className="bg-paper border-border text-foreground flex size-9 flex-none items-center justify-center rounded-full border text-sm"
              >
                ↗
              </Link>
            ) : (
              <span className="text-muted-foreground/70 flex-none text-xs">{step.meta}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

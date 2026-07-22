import { Reveal } from "@/components/ui/reveal";
import { SectionBadge } from "./section-badge";

/**
 * French high punctuation (? ! ; :) takes an *espace insécable*. Applied at
 * render so the source copy stays greppable against the brief — and so a lone
 * « ? » can never strand itself on a line of its own.
 */
const nbsp = (s: string) => s.replace(/ ([?!;:»])/g, " $1");

/** « Qui sommes-nous ? » — client copy, 2026-07-22, verbatim. */
const paragraphs = [
  "Depuis plus de trois décennies, nous mettons notre maîtrise du second œuvre au service des particuliers confrontés à un dégât des eaux.",
  "Notre démarche est née d’une réalité incontestable : pour un assuré, obtenir un devis fiable dans un délai raisonnable est devenu un défi permanent, freiné par le manque de disponibilité des artisans.",
  "Nous avons conçu une réponse directe et sans intermédiaire. Chaque dossier est analysé avec l’œil du professionnel de chantier pour délivrer un chiffrage rigoureux, juste et parfaitement conforme aux exigences des compagnies d’assurance.",
  "En éliminant les déplacements inutiles, nous transformons une démarche souvent longue en un processus fluide : un gain de temps décisif pour vous, et un impact carbone évité.",
] as const;

const engagements = [
  "30 ans d’expertise du bâtiment au service de votre dossier",
  "Chiffrage d’expert accepté par les assurances",
  "Évaluation au juste prix du marché",
  "Démarche écoresponsable sans trajets superflus",
  "Traitement accéléré pour débloquer votre indemnisation",
] as const;

function CheckMark() {
  return (
    <span
      aria-hidden
      className="bg-success-soft text-success-strong mt-0.5 flex size-5 flex-none items-center justify-center rounded-full"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3">
        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * « Qui sommes-nous ? » (client, 2026-07-22) — the credibility section the nav
 * now points at. Two-hander: the story on the left, the five commitments as a
 * scannable card on the right, so a visitor who only skims still gets the
 * argument (30 ans de métier, devis accepté, sans déplacement).
 */
export function AboutSection() {
  return (
    <section id="qui-sommes-nous" className="bg-card scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div>
            <SectionBadge>{nbsp("Qui sommes-nous ?")}</SectionBadge>
            <h2 className="font-display mt-4 max-w-lg text-3xl leading-snug font-bold md:text-4xl">
              Trente ans de métier, <span className="text-link">l’exigence du terrain.</span>
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              {paragraphs.map((text) => (
                <p key={text} className="text-steel max-w-2xl text-base leading-relaxed">
                  {nbsp(text)}
                </p>
              ))}
            </div>
          </div>

          {/* self-start: the card sizes to its five lines instead of stretching
              to the height of the story column, which left a dead gap under it. */}
          <Reveal delay={0.1} className="lg:self-start">
            <div className="border-border-faint bg-paper rounded-panel shadow-card border p-6 md:p-7">
              <h3 className="font-display text-lg font-bold">Notre engagement</h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {engagements.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckMark />
                    <span className="text-steel text-sm leading-relaxed">{nbsp(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

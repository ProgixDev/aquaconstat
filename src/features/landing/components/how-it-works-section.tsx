import Link from "next/link";
import { cn } from "@/lib/utils";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { Reveal } from "@/components/ui/reveal";
import { CtaButton } from "./cta-button";
import { SectionBadge } from "./section-badge";
import { SectionNote } from "./section-note";

/**
 * `kind` labels the meta so the row of chips means something consistent:
 * what each step costs you (durée / à prévoir / prix) versus what it hands
 * back (résultat) — the arc from “you do” to “you receive”.
 */
const steps = [
  {
    title: "Créez votre dossier",
    text: "Vos coordonnées et l’adresse du bien concerné. 2 minutes.",
    kind: "Durée",
    meta: "2 min",
  },
  {
    title: "Décrivez le sinistre",
    text: "Un questionnaire guidé : les pièces touchées, ce qu’il faut refaire, la surface approximative.",
    kind: "Durée",
    meta: "≈ 2 min",
  },
  {
    title: "Ajoutez vos photos",
    text: "Depuis la galerie ou l’appareil photo, en suivant nos consignes de prise de vue.",
    kind: "À prévoir",
    meta: "4 à 8 photos",
  },
  {
    title: "Payez en ligne",
    text: "82,90 € par carte bancaire, dans l’environnement sécurisé de Stripe.",
    kind: "Prix",
    meta: "82,90 € TTC",
  },
  {
    title: "Recevez votre devis",
    text: "Un devis détaillé, préparé par un professionnel, envoyé par e-mail sous 48 h ouvrées.",
    kind: "Résultat",
    meta: "PDF par e-mail",
  },
] as const;

/** The document’s top corner, cropped by the tile — a teaser for the full devis
 *  reveal in « Ce que vous recevez ». Abstract lines: it suggests the shape of
 *  the deliverable without competing with the real card. */
function DevisTeaser() {
  return (
    <div aria-hidden className="pointer-events-none hidden lg:block lg:w-60 lg:shrink-0">
      <div className="bg-card shadow-pdf -mb-16 rotate-2 rounded-t-lg px-5 pt-4 pb-8">
        <div className="flex items-center gap-2">
          <DropletGlyph />
          <span className="font-display text-foreground text-[10px] font-bold tracking-widest">
            ÔLALA
          </span>
          <span className="text-muted-foreground ml-auto text-[10px] font-semibold">PDF</span>
        </div>
        <div className="border-border-soft mt-3 flex flex-col gap-2 border-t pt-3">
          {[100, 82, 91, 68].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="bg-border-soft h-1.5 flex-1 rounded-full"
                style={{ width: `${w}%` }}
              />
              <span className="bg-aqua/25 h-1.5 w-9 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * « Comment ça marche » — a poster wall, not a timeline. Five plates on a navy
 * stage anchored by full-contrast display numerals (they carry the sequence);
 * the run breaks 3-over-2 so the last plate runs double width and closes the
 * section with the payoff — the devis, and the CTA to go get it.
 */
export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="bg-navy-band relative scroll-mt-20 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="bg-grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
        <div className="from-aqua/12 absolute -top-32 left-1/2 h-96 w-[70rem] -translate-x-1/2 rounded-[50%] bg-radial to-transparent to-70%" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <SectionBadge variant="navy">Comment ça marche</SectionBadge>
            <h2 className="font-display text-secondary-foreground mt-4 max-w-sm text-3xl leading-snug font-bold md:text-4xl">
              Dix minutes, cinq étapes, un devis.
            </h2>
          </div>
          <SectionNote variant="navy">
            Votre dossier n’est transmis qu’une fois le paiement confirmé.
          </SectionNote>
        </div>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={step.title} className={cn(last && "md:col-span-2")}>
                <Reveal delay={i * 0.06} className="h-full">
                  <article
                    className={cn(
                      "border-aqua-pale/15 bg-navy-deep/70 rounded-panel relative h-full overflow-hidden border p-6 md:p-7",
                      last && "lg:flex lg:items-center lg:gap-8",
                    )}
                  >
                    <div className={cn("flex h-full flex-col", last && "lg:flex-1")}>
                      {/* Full contrast: the numeral is what carries 1→5. */}
                      <span
                        aria-hidden
                        className="font-display text-aqua-bright block text-4xl leading-none font-bold italic md:text-5xl"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-secondary-foreground mt-5 text-lg font-semibold md:text-xl">
                        {i === 0 ? (
                          <Link
                            href="/dossier"
                            className="hover:text-aqua-bright transition-colors"
                          >
                            {step.title} <span aria-hidden>↗</span>
                          </Link>
                        ) : (
                          step.title
                        )}
                      </h3>
                      <p className="text-mist/65 mt-2.5 mb-5 max-w-md text-sm leading-relaxed">
                        {step.text}
                      </p>
                      {/* mt-auto: the meta rule anchors the tile’s bottom edge, so a
                          short step doesn’t leave dead space when a taller one
                          (the payoff, with its CTA) sets the row height. */}
                      <div className="border-aqua-pale/12 mt-auto border-t pt-3 text-[11px] font-semibold tracking-wider uppercase">
                        <span className="text-aqua-pale/45">{step.kind}</span>
                        <span className="text-aqua-pale/25"> · </span>
                        <span className="text-aqua-pale/75">{step.meta}</span>
                      </div>

                      {last && (
                        <div className="mt-6">
                          <CtaButton href="/dossier" size="sm">
                            Démarrer mon dossier
                          </CtaButton>
                        </div>
                      )}
                    </div>

                    {last && <DevisTeaser />}
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

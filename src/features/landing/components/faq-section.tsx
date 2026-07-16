"use client";

import { useState } from "react";
import { m } from "@/components/motion";
import { cn } from "@/lib/utils";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const faqs = [
  {
    q: "Quel est le délai exact pour recevoir mon devis ?",
    a: "Votre devis détaillé est envoyé par e-mail sous 48 h ouvrées après la confirmation de votre paiement. Si une précision vous est demandée entre-temps, le délai ne repart pas de zéro.",
  },
  {
    q: "Quels types de sinistres sont couverts ?",
    a: "Tous les dégâts des eaux courants : fuite, infiltration, débordement, rupture de canalisation — dans un logement ou un local à usage d’habitation, que vous soyez propriétaire, locataire, bailleur ou syndic. Un doute sur votre situation ? Écrivez-nous avant de démarrer : le paiement n’intervient qu’à la dernière étape, vous ne risquez rien en préparant votre dossier.",
  },
  {
    q: "Je ne connais pas les dimensions exactes des surfaces touchées.",
    a: "Aucune mesure n’est demandée : le questionnaire vous propose simplement une taille approximative par pièce — petite (moins de 10 m²), moyenne (10 à 20 m²) ou grande. Le professionnel affine ensuite grâce à vos photos ; c’est exactement pour cela qu’elles sont demandées.",
  },
  {
    q: "Et si mon dossier ne peut pas être traité ?",
    a: "Vous êtes intégralement remboursé — pas un avoir, pas de frais retenus. Si le professionnel estime que votre sinistre ne peut pas être chiffré sérieusement à distance (c’est rare), nous vous prévenons par e-mail et le remboursement est déclenché sur la carte utilisée pour le paiement, sans aucune démarche de votre part. En clair : vous ne payez que si un devis peut réellement vous être livré.",
  },
  {
    q: "Quelle zone est couverte ?",
    a: "Toute la France métropolitaine, quel que soit le type de bien : maison, appartement, en copropriété ou en location. Votre bien est situé ailleurs ? Écrivez-nous d’abord — nous vous confirmerons si votre dossier peut être étudié avant que vous n’engagiez quoi que ce soit.",
  },
  {
    q: "Comment le devis est-il envoyé ?",
    a: "Au format PDF, par e-mail, à l’adresse indiquée dans votre dossier — prêt à être transmis à votre assurance.",
  },
] as const;

/** Plus that becomes a minus — the vertical stroke collapses, the horizontal stays. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative mt-0.5 size-5 flex-none transition-colors",
        open ? "text-link" : "text-hint group-hover:text-link",
      )}
    >
      <span className="absolute top-1/2 left-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ease-out",
          open ? "scale-y-0" : "scale-y-100",
        )}
      />
    </span>
  );
}

/**
 * FAQ (spec 002, AC-2) — one column of hairline rows. A two-column grid meant
 * an opening answer stretched its row and left a hole beside it; in one column
 * the list simply grows. Each trigger is wrapped in a heading so the questions
 * are navigable landmarks. Answers stay mounted (height 0, aria-hidden) when
 * collapsed — this is doubt-resolving, SEO-relevant copy, so it must exist in
 * the DOM, not only after a click.
 */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="from-mist/70 via-background to-aqua-pale/40 relative scroll-mt-20 overflow-hidden bg-linear-160"
    >
      <div
        aria-hidden
        className="from-aqua-bright/20 absolute -top-24 -left-32 size-120 rounded-full bg-radial to-transparent to-70%"
      />
      <div
        aria-hidden
        className="from-aqua-pale/40 absolute -right-40 -bottom-40 size-140 rounded-full bg-radial to-transparent to-70%"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Centred against the list so the column reads as composed rather
              than top-heavy, and the note becomes the thing it was only
              describing: a way to actually write to someone. */}
          <div className="lg:self-center">
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="font-display mt-4 max-w-xs text-2xl leading-snug font-bold md:text-3xl">
              Questions fréquentes
            </h2>

            <div className="border-border-soft bg-paper/70 rounded-panel shadow-card mt-7 max-w-xs border p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <DropletGlyph />
                Une autre question ?
              </div>
              <a
                href="mailto:contact@olala.fr"
                className="text-link hover:text-link-hover mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-1 underline-offset-4 transition-colors"
              >
                Écrivez-nous à contact@olala.fr
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>

          <div className="border-border-soft divide-border-soft divide-y border-t border-b">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q}>
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full cursor-pointer items-start justify-between gap-6 py-4.5 text-left"
                    >
                      <span
                        className={cn(
                          "text-base font-semibold transition-colors",
                          isOpen ? "text-link" : "text-foreground group-hover:text-link",
                        )}
                      >
                        {faq.q}
                      </span>
                      <PlusMinus open={isOpen} />
                    </button>
                  </h3>
                  <m.div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    aria-hidden={!isOpen}
                    initial={false}
                    animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted-foreground m-0 max-w-2xl pr-10 pb-5 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </m.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

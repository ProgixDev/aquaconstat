"use client";

import { useState } from "react";
import { AnimatePresence, m } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SectionBadge } from "./section-badge";

const faqs = [
  {
    q: "Quel est le délai exact pour recevoir mon devis ?",
    a: "Votre devis détaillé est envoyé par e-mail sous 48 h ouvrées après la confirmation de votre paiement. Si une précision vous est demandée entre-temps, le délai ne repart pas de zéro.",
  },
  {
    q: "Quels types de sinistres sont couverts ?",
    a: "Tous les dégâts des eaux courants : fuite, infiltration, débordement, rupture de canalisation — dans un logement ou un local à usage d’habitation.",
  },
  {
    q: "Je ne connais pas les dimensions exactes des surfaces touchées.",
    a: "Des dimensions approximatives suffisent. Une estimation à 20 cm près convient parfaitement pour établir le devis.",
  },
  {
    q: "Et si mon dossier ne peut pas être traité ?",
    a: "Si votre dossier ne peut pas être étudié à distance, vous êtes intégralement remboursé, sans démarche supplémentaire.",
  },
  {
    q: "Quelle zone est couverte ?",
    a: "Le service couvre l’ensemble de la France métropolitaine.",
  },
  {
    q: "Comment le devis est-il envoyé ?",
    a: "Au format PDF, par e-mail, à l’adresse indiquée dans votre dossier — prêt à être transmis à votre assurance.",
  },
] as const;

/** FAQ — compact tinted band, animated accordion (spec 002, AC-2). */
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
      <div className="relative mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="font-display mt-3 text-2xl leading-snug font-bold md:text-3xl">
              Questions fréquentes
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Une autre question ? Écrivez-nous à contact@aquaconstat.fr.
          </p>
        </div>
        <div className="mt-7 grid items-start gap-2.5 md:grid-cols-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className={cn(
                  "bg-paper/85 rounded-lg border backdrop-blur-sm transition-colors",
                  isOpen ? "border-aqua/50" : "border-border-soft hover:border-aqua/40",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="text-foreground flex w-full cursor-pointer items-center justify-between gap-4 px-4.5 py-3.5 text-left text-sm font-semibold"
                >
                  {faq.q}
                  <m.span
                    aria-hidden
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="bg-muted text-link flex size-6 flex-none items-center justify-center rounded-full text-base font-normal"
                  >
                    +
                  </m.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground m-0 px-4.5 pb-4 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

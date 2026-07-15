"use client";

import { useState } from "react";
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

/** FAQ accordion — one item open at a time, keyboard-operable (spec 002, AC-2). */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-card scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-x-16 gap-y-10 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionBadge>FAQ</SectionBadge>
          <h2 className="font-display mt-5 text-3xl leading-snug font-bold md:text-4xl">
            Questions fréquentes
          </h2>
          <p className="text-muted-foreground mt-4 text-sm">
            Une autre question ? Écrivez-nous à contact@aquaconstat.fr.
          </p>
        </div>
        <div className="border-border-soft border-t">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-border-soft border-b">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="text-foreground flex w-full cursor-pointer items-center justify-between gap-4.5 py-5.5 text-left text-base font-semibold md:text-lg"
                >
                  {faq.q}
                  <span
                    aria-hidden
                    className="bg-muted text-link flex size-7 flex-none items-center justify-center rounded-full text-base font-normal"
                  >
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p
                    id={`faq-panel-${i}`}
                    className="text-muted-foreground m-0 pr-11 pb-5 text-sm leading-relaxed"
                  >
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

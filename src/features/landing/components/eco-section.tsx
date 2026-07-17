import { SectionBadge } from "./section-badge";

/**
 * « Éco-responsable » (client copy, 2026-07-16) — the remote model's green
 * payoff, placed right after « Comment ça marche »: once the visitor has seen
 * the five at-distance steps, the no-truck argument reinforces « sans
 * déplacement » with a benefit rather than a feature. Kept light and compact —
 * one claim, one paragraph, no CTA (the surrounding sections already carry the
 * conversion weight).
 */
export function EcoSection() {
  return (
    <section className="bg-card relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="from-aqua-pale/25 absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-70%" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:py-18">
        <div className="flex justify-center">
          <SectionBadge>Éco-responsable</SectionBadge>
        </div>
        <h2 className="font-display mt-4 text-3xl leading-snug font-bold md:text-4xl">
          <span aria-hidden>🌱 </span>0 kilomètre parcouru, 100 % d’efficacité.
        </h2>
        <p className="text-steel mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg">
          Pourquoi faire rouler un camion pour de simples photos ? En chiffrant votre sinistre à
          distance, Ôlala supprime les trajets inutiles. C’est bon pour votre agenda, et parfait
          pour la planète.
        </p>
      </div>
    </section>
  );
}

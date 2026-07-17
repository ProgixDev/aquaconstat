import { EcoAnimation } from "./eco-animation";
import { SectionBadge } from "./section-badge";

/**
 * « Éco-responsable » (client copy, 2026-07-16) — the remote model's green
 * payoff, placed right after « Comment ça marche »: once the visitor has seen
 * the five at-distance steps, the no-truck argument reinforces « sans
 * déplacement » with a benefit rather than a feature. Kept light and compact —
 * one claim, one paragraph, no CTA (the surrounding sections already carry the
 * conversion weight). The 🌱 emoji became an animated globe (client request).
 */
export function EcoSection() {
  return (
    <section className="bg-eco-band relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        {/* A soft green halo cradles the globe — nature emanating from the
            earth, kept to the one teal-green the palette already carries. */}
        <div className="from-success/15 absolute top-8 left-1/2 size-80 -translate-x-1/2 rounded-full bg-radial to-transparent to-70% blur-2xl" />
        {/* Gentle rolling ground: a green hill settling into an aqua one — the
            nature vibe resolving back into the brand's water. */}
        <svg
          className="absolute inset-x-0 bottom-0 h-28 w-full md:h-36"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,108 C240,50 480,168 720,128 C960,88 1200,150 1440,98 L1440,200 L0,200 Z"
            className="fill-success/10"
          />
          <path
            d="M0,150 C300,104 600,186 900,154 C1140,130 1320,172 1440,138 L1440,200 L0,200 Z"
            className="fill-aqua/10"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:py-18">
        <div className="flex justify-center">
          <SectionBadge>Éco-responsable</SectionBadge>
        </div>
        <EcoAnimation />
        <h2 className="font-display mt-2 text-3xl leading-snug font-bold md:text-4xl">
          0 kilomètre parcouru, 100 % d’efficacité.
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

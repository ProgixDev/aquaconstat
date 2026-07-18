"use client";

import { m } from "@/components/motion";
import { SectionBadge } from "./section-badge";

/**
 * Hero kicker — the category label promoted out of the text column and set as
 * a rule across the top of the hero, bookending the hairline + stat row that
 * close it. Frames the composition and lets the headline lead its column.
 */
export function HeroKicker() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      /* Phones read as one centred column (badge + slogan lockup); sm+ goes
         editorial — label left, rule, slogan right. */
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:justify-start"
    >
      {/* The rule must never squeeze the label into wrapping — but only once
          the rule exists (sm+). Holding shrink-0 below sm pushed the label past
          a 320px viewport, where the hero's overflow-hidden silently ate it. */}
      <div className="sm:shrink-0">
        <SectionBadge variant="navy">Dégât des eaux · Devis à distance</SectionBadge>
      </div>
      <span aria-hidden className="bg-aqua-pale/15 hidden h-px flex-1 sm:block" />
      {/* Brand slogan (client, 2026-07-18) — bookends the kicker rule on sm+
          (category label left, brand voice right); on phones it takes its own
          compact line right under the badge. */}
      <span className="font-display text-slogan w-full text-center text-base font-bold italic sm:w-auto sm:shrink-0 sm:text-left md:text-lg">
        Du sinistre à la solution
      </span>
    </m.div>
  );
}

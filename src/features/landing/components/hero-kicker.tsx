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
      className="flex items-center gap-6"
    >
      {/* The rule must never squeeze the label into wrapping — but only once
          the rule exists (sm+). Holding shrink-0 below sm pushed the label past
          a 320px viewport, where the hero's overflow-hidden silently ate it. */}
      <div className="sm:shrink-0">
        <SectionBadge variant="navy">Dégât des eaux · Devis à distance</SectionBadge>
      </div>
      <span aria-hidden className="bg-aqua-pale/15 hidden h-px flex-1 sm:block" />
    </m.div>
  );
}

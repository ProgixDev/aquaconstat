"use client";

import { m } from "@/components/motion";

/**
 * Step-content entrance — the card body rises in softly on every step, so
 * moving through the funnel feels alive instead of pages snapping into place.
 * One wrapper, not per-element choreography: a form is a tool, the motion
 * should say « ready », not perform. Reduced motion is honored globally by
 * MotionConfig.
 */
export function StepTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}

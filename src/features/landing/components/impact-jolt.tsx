"use client";

import { useEffect, useRef } from "react";
import { IMPACT_EVENT } from "./hero-droplet";

type ImpactJoltProps = {
  children: React.ReactNode;
  className?: string;
  /** ms after the impact before this element reacts — sells the shockwave. */
  delay?: number;
};

/**
 * Positioning wrapper that jolts its content when the hero droplet lands
 * (IMPACT_EVENT) — used by the floating trust chips so the whole scene
 * reacts to the splash. The inner element keeps its own idle drift; the
 * jolt runs on this wrapper so the two transforms compose.
 */
export function ImpactJolt({ children, className, delay = 0 }: ImpactJoltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onImpact = () => {
      ref.current?.animate(
        {
          transform: [
            "translateY(0) rotate(0deg)",
            "translateY(7px) rotate(-2deg)",
            "translateY(-4px) rotate(1.2deg)",
            "translateY(0) rotate(0deg)",
          ],
        },
        { duration: 620, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    };
    window.addEventListener(IMPACT_EVENT, onImpact);
    return () => window.removeEventListener(IMPACT_EVENT, onImpact);
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

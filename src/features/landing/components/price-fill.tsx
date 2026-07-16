"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The price floods with water when it scrolls into view: a ghosted numeral with
 * a copy revealed bottom-up — deep navy at the base, lit aqua at the surface.
 * Reads as the brand rather than a generic count-up, and the real figure is
 * always in the DOM: the fill is decoration.
 *
 * `motion-safe` carries the reduced-motion contract in CSS, so those users get
 * the filled figure with no tween (and we avoid a setState-in-effect cascade).
 */
export function PriceFill({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="relative inline-block">
      {/* The readable figure — empty glass. */}
      <span className="text-navy/12">{value}</span>

      {/* The water. Deep at the bottom, lit at the surface — which also buys
          the contrast an all-aqua figure never had on a pale stage. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-[1800ms] motion-safe:ease-out"
        style={{ height: filled ? "100%" : "0%" }}
      >
        <span className="from-navy via-aqua to-aqua-bright absolute bottom-0 left-0 bg-linear-0 bg-clip-text whitespace-nowrap text-transparent">
          {value}
        </span>
      </span>
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type StatCounterProps = {
  /** Display value, e.g. « 48 h », « 100 % », « Stripe ». */
  value: string;
};

/**
 * Counts a leading number up from zero when it scrolls into view (once);
 * values without a number — and reduced-motion users — render as-is.
 */
export function StatCounter({ value }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = /^(\d+)(.*)$/.exec(value);
    const el = ref.current;
    if (!match || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = Number(match[1]);
    const rest = match[2] ?? "";
    let raf = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (time: number) => {
          const k = Math.min((time - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - k, 3);
          setDisplay(`${Math.round(target * eased)}${rest}`);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import animationData from "./greenify-earth.json";

// lottie-react pulls in lottie-web, which touches `document` at import — load
// it client-only so it never runs during SSR of this client component.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/**
 * The animated globe for the « Éco-responsable » band (replaces the 🌱 emoji).
 * Decorative, so `aria-hidden`. Deferred two ways, matching the rest of the
 * landing: the player only mounts once the band scrolls into view (no wasted
 * work above the fold), and reduced-motion users get the still first frame
 * rather than the loop. The source Lottie shipped a « SAVE THE AMAZON » text
 * layer — stripped from the JSON so only the globe and its growing trees play.
 */
export function EcoAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  // `reduce` is read when the band scrolls in (window isn't available at SSR);
  // both fields are set together in the observer callback — never in the effect
  // body, which the render rules disallow.
  const [state, setState] = useState({ visible: false, reduce: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          setState({ visible: true, reduce });
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="mx-auto size-44 md:size-56">
      {state.visible && (
        <Lottie animationData={animationData} loop={!state.reduce} autoplay={!state.reduce} />
      )}
    </div>
  );
}

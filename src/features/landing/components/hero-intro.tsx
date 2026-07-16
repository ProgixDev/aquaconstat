"use client";

import { Fragment, useEffect, useRef } from "react";
import { m } from "@/components/motion";
import { CtaButton } from "./cta-button";
import { IMPACT_EVENT } from "./hero-droplet";

/* « sans attendre » stays one unit so line-balancing can’t split the promise. */
const words: { text: string; em?: boolean }[] = [
  { text: "Votre" },
  { text: "devis" },
  { text: "dégât" },
  { text: "des" },
  { text: "eaux," },
  { text: "sans attendre", em: true },
  { text: "le" },
  { text: "passage" },
  { text: "d’un" },
  { text: "artisan" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
} as const;

const block = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
} as const;

const word = {
  hidden: { opacity: 0, y: "0.55em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

/**
 * Hero left column with entrance choreography — badge, headline (word by
 * word), pitch, CTAs and price note rise in with a stagger on load. The
 * headline also takes a tiny jolt when the droplet lands (IMPACT_EVENT).
 */
export function HeroIntro() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onImpact = () => {
      headingRef.current?.animate(
        {
          transform: ["translateY(0)", "translateY(3px)", "translateY(-2px)", "translateY(0)"],
        },
        { duration: 380, easing: "ease-out" },
      );
    };
    window.addEventListener(IMPACT_EVENT, onImpact);
    return () => window.removeEventListener(IMPACT_EVENT, onImpact);
  }, []);

  return (
    <m.div variants={container} initial="hidden" animate="visible">
      <h1
        ref={headingRef}
        /* Inside the pinned hero the headline scales with viewport height —
           it is the tallest term in the column, so a fixed 60px is what pushed
           the stat row into the scroll cue on short laptops. */
        /* 32px on the narrowest phones (else the headline runs to 5 lines at
           320px), 36px from 360px up, then the height-scaled clamp once pinned. */
        className="font-display text-secondary-foreground max-w-[15ch] text-[2rem] leading-[1.08] font-bold text-balance min-[360px]:text-4xl min-[360px]:leading-[1.06] md:text-6xl lg:text-[clamp(2.75rem,5.5svh,3.75rem)]"
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <m.span
              variants={word}
              className="inline-block whitespace-nowrap will-change-transform"
            >
              {w.em ? <em className="text-aqua-bright">{w.text}</em> : w.text}
            </m.span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </h1>
      {/* Nothing between the headline and the CTA by design: the headline
          states the offer, the stat row states the proof, and « Comment ça
          marche » tells the process in full a screen below. */}
      {/* One primary, one quiet anchor — two matched pills competed with each
          other and made the yellow CTA read as merely one of two options. */}
      {/* On a phone the primary CTA goes full-width — a bigger tap target that
          reads as intentional, not a pill floating mid-line — with the quiet
          anchor centred beneath it. From sm up it returns to a compact row. */}
      <m.div
        variants={block}
        className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-5 lg:mt-[clamp(1.5rem,4svh,2.5rem)]"
      >
        <CtaButton href="/dossier" size="lg" className="w-full text-center sm:w-auto">
          Démarrer mon dossier
        </CtaButton>
        <a
          href="#comment-ca-marche"
          className="text-aqua-pale hover:text-secondary-foreground group inline-flex items-center justify-center gap-2 text-sm font-semibold sm:justify-start"
        >
          Comment ça marche
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
          </svg>
        </a>
      </m.div>
    </m.div>
  );
}

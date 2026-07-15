"use client";

import { Fragment, useEffect, useRef } from "react";
import { m } from "@/components/motion";
import { CtaButton } from "./cta-button";
import { IMPACT_EVENT } from "./hero-droplet";
import { SectionBadge } from "./section-badge";

const words: { text: string; em?: boolean }[] = [
  { text: "Votre" },
  { text: "devis" },
  { text: "dégât" },
  { text: "des" },
  { text: "eaux," },
  { text: "sans", em: true },
  { text: "attendre", em: true },
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
      <m.div variants={block}>
        <SectionBadge variant="navy">Dégât des eaux · Devis à distance</SectionBadge>
      </m.div>
      <h1
        ref={headingRef}
        className="font-display text-secondary-foreground mt-7 text-4xl leading-[1.08] font-bold md:text-6xl"
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <m.span variants={word} className="inline-block will-change-transform">
              {w.em ? <em className="text-aqua-bright">{w.text}</em> : w.text}
            </m.span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </h1>
      <m.p
        variants={block}
        className="text-mist/85 mt-7 max-w-lg text-base leading-relaxed md:text-lg"
      >
        Décrivez votre sinistre, ajoutez vos photos, et recevez sous 48 h ouvrées un devis détaillé
        à transmettre à votre assurance. 100 % en ligne, depuis votre téléphone.
      </m.p>
      <m.div variants={block} className="mt-9 flex flex-wrap items-center gap-4">
        <CtaButton href="/dossier">Démarrer mon dossier</CtaButton>
        <a
          href="#comment-ca-marche"
          className="border-aqua-pale/30 text-background hover:border-aqua-pale/60 inline-block rounded-full border px-6 py-3.5 text-sm font-semibold"
        >
          Comment ça marche
        </a>
      </m.div>
      <m.div variants={block} className="text-aqua-pale/85 mt-4 text-xs">
        149 € · paiement sécurisé Stripe · sans création de compte
      </m.div>
    </m.div>
  );
}

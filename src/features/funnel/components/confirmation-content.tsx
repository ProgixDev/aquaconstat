"use client";

import { m } from "@/components/motion";
import { BackLink } from "./back-link";
import { useFunnelStore } from "../provider";

/* Entrance choreography — the page celebrates: ripple first, then each block
   rises in sequence. Reduced motion is honored globally by MotionConfig. */
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

const suite = [
  {
    title: "Étude du dossier",
    text: "Un professionnel examine vos réponses et vos photos.",
  },
  {
    title: "Préparation du devis",
    text: "Chiffrage poste par poste des travaux de remise en état.",
  },
  {
    title: "Envoi par e-mail",
    text: "Votre devis PDF, prêt à être transmis à votre assurance.",
  },
] as const;

/** Confirmation — ripple droplet, référence in display type, « la suite » timeline. */
export function ConfirmationContent() {
  const prenom = useFunnelStore((s) => s.data.prenom);
  const email = useFunnelStore((s) => s.data.email);
  const reference = useFunnelStore((s) => s.reference);

  return (
    <m.main
      variants={container}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-xl flex-1 px-6 pt-14 pb-16 text-center md:px-12"
    >
      <m.div variants={item} aria-hidden className="relative mx-auto size-30">
        <span className="border-aqua-bright/55 animate-droplet-ripple absolute inset-0 rounded-full border-[1.5px]" />
        <span className="border-aqua-bright/45 animate-droplet-ripple-alt absolute inset-0 rounded-full border-[1.5px]" />
        <span className="bg-info absolute inset-3.5 rounded-full" />
        <span className="rounded-droplet from-aqua-bright to-aqua absolute top-1/2 left-1/2 size-8 -translate-x-[52%] -translate-y-[58%] rotate-45 bg-linear-135" />
      </m.div>
      <m.h1 variants={item} className="font-display mt-8 text-3xl font-bold md:text-4xl">
        {prenom ? `Merci ${prenom}, votre dossier est envoyé ✓` : "Votre dossier est envoyé ✓"}
      </m.h1>
      {/* Reference in an aqua gradient ring — the one thing to keep, so it
          reads as the page's jewel rather than a plain grey box. */}
      <m.div
        variants={item}
        className="from-aqua-bright/60 to-aqua/60 mt-5.5 inline-block rounded-xl bg-linear-135 p-px"
      >
        <div className="bg-card rounded-[calc(0.75rem-1px)] px-7 py-4">
          <div className="text-hint text-xs font-semibold tracking-widest uppercase">Référence</div>
          <div className="font-display mt-1 text-2xl tracking-wider">{reference ?? "—"}</div>
        </div>
      </m.div>
      <m.p variants={item} className="text-steel mx-auto mt-6 max-w-md text-base leading-relaxed">
        Vous recevrez votre devis par e-mail{" "}
        {email ? (
          <>
            à <strong className="text-foreground">{email}</strong>
          </>
        ) : (
          "à l’adresse indiquée dans votre dossier"
        )}{" "}
        sous 48 h ouvrées.
      </m.p>

      {/* « La suite » as a numbered timeline — circles linked by a rail, so
          the three steps read as a journey already in motion. */}
      <m.div variants={item} className="mx-auto mt-11 max-w-lg text-left">
        <div className="text-link text-center text-xs font-semibold tracking-[0.3em] uppercase">
          La suite
        </div>
        <div className="mt-6 flex flex-col">
          {suite.map((step, i) => (
            <div key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
              {i < suite.length - 1 && (
                <span
                  aria-hidden
                  className="from-aqua/60 to-aqua-pale/40 absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5 rounded-full bg-linear-180"
                />
              )}
              <span className="from-aqua-bright to-aqua text-secondary-foreground relative flex size-8 flex-none items-center justify-center rounded-full bg-linear-135 text-sm font-bold shadow-sm">
                {i + 1}
              </span>
              <div className="pt-1">
                <div className="text-[15px] font-semibold">{step.title}</div>
                <div className="text-steel mt-1 text-sm">{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </m.div>

      <m.p variants={item} className="text-muted-foreground mt-9 text-sm">
        Un e-mail de confirmation vient de vous être envoyé.
        <br />
        Une question ? Répondez simplement à cet e-mail.
      </m.p>
      <m.div variants={item} className="mt-7 flex justify-center">
        <BackLink href="/">Retour à l’accueil</BackLink>
      </m.div>
      {/* Closing brand moment (client, 2026-07-18) — the slogan lands right
          where the promise was just delivered. */}
      <m.p variants={item} className="font-display text-hint mt-10 text-sm font-semibold italic">
        Ôlala — Du sinistre à la solution.
      </m.p>
    </m.main>
  );
}

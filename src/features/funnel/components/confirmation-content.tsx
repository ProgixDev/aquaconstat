"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { m } from "@/components/motion";
import { confirmAndSend } from "../actions";
import { loadPhotos } from "../photo-storage";
import { useFunnelStore, useFunnelStoreApi } from "../provider";
import { BackLink } from "./back-link";

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
  { title: "Étude du dossier", text: "Un professionnel examine vos réponses et vos photos." },
  {
    title: "Préparation du devis",
    text: "Chiffrage poste par poste des travaux de remise en état.",
  },
  {
    title: "Envoi par e-mail",
    text: "Votre devis détaillé, prêt à être transmis à votre assurance.",
  },
] as const;

type Done = { reference: string; email: string; prenom: string; emailLive: boolean };
type Phase = "working" | "done" | "missing" | "error";

/**
 * Confirmation — the funnel's server-side finish.
 *
 * Payment lands here after Stripe (or the demo). We verify the session, e-mail
 * the dossier + photos to the operator and a confirmation to the customer, then
 * wipe the local dossier so a refresh can't resend it. The result is cached in
 * sessionStorage per session id, so a reload shows the same page without firing
 * a second send (and React's dev double-mount can't double-send either).
 */
export function ConfirmationContent() {
  const sessionId = useSearchParams().get("session_id");
  const hydrated = useFunnelStore((s) => s.hydrated);
  const storeApi = useFunnelStoreApi();

  // Initial phase is decided at render, not by a setState in the effect: no
  // session ⇒ nothing to confirm; a cached result (this tab already confirmed
  // this session) ⇒ show it again without re-sending; otherwise work.
  const [state, setState] = useState<{ phase: Phase; done: Done | null }>(() => {
    if (!sessionId) return { phase: "missing", done: null };
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`olala:confirm:${sessionId}`);
        if (cached) return { phase: "done", done: JSON.parse(cached) as Done };
      } catch {
        /* unreadable cache — fall through and re-confirm */
      }
    }
    return { phase: "working", done: null };
  });
  const firedRef = useRef(false);

  useEffect(() => {
    if (state.phase !== "working" || !sessionId || !hydrated || firedRef.current) return;
    firedRef.current = true;

    void (async () => {
      try {
        const { data } = storeApi.getState();
        // Photos were already uploaded to the bucket at checkout and are never
        // attached to the e-mail — so this page only needs to pass their
        // names/dates for the operator e-mail's photo list, not re-upload bytes.
        const stored = await loadPhotos();

        const form = new FormData();
        form.set("sessionId", sessionId);
        form.set("dossier", JSON.stringify(data));
        const meta = stored
          .filter((photo) => photo.blob)
          .map((photo) => ({ name: photo.name, takenAt: photo.takenAt }));
        form.set("photosMeta", JSON.stringify(meta));

        const res = await confirmAndSend(form);
        if (!res.ok) {
          setState({ phase: "error", done: null });
          return;
        }
        const done: Done = {
          reference: res.reference,
          email: res.email || data.email,
          prenom: data.prenom,
          emailLive: res.emailLive,
        };
        try {
          sessionStorage.setItem(`olala:confirm:${sessionId}`, JSON.stringify(done));
        } catch {
          /* storage full/blocked — the page still shows the result */
        }
        setState({ phase: "done", done });
        // Dossier delivered — clear it so a refresh can't resend and the next
        // visitor on this device starts fresh.
        storeApi.getState().clearFunnel();
      } catch {
        setState({ phase: "error", done: null });
      }
    })();
  }, [state.phase, sessionId, hydrated, storeApi]);

  const { phase, done } = state;

  if (phase === "working") {
    return (
      <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-xl flex-1 px-6 py-20 text-center md:px-12">
        <div aria-hidden className="relative mx-auto size-30">
          <span className="border-aqua-bright/55 animate-droplet-ripple absolute inset-0 rounded-full border-[1.5px]" />
          <span className="border-aqua-bright/45 animate-droplet-ripple-alt absolute inset-0 rounded-full border-[1.5px]" />
          <span className="bg-info absolute inset-3.5 rounded-full" />
          <span className="rounded-droplet from-aqua-bright to-aqua absolute top-1/2 left-1/2 size-8 -translate-x-[52%] -translate-y-[58%] rotate-45 bg-linear-135" />
        </div>
        <p className="text-steel mt-8 text-base">Finalisation de votre dossier…</p>
      </main>
    );
  }

  if (phase === "missing" || phase === "error") {
    const isError = phase === "error";
    return (
      <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-xl flex-1 px-6 py-16 text-center md:px-12">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {isError ? "Nous n’avons pas pu finaliser l’envoi" : "Aucun paiement trouvé"}
        </h1>
        <p className="text-steel mx-auto mt-4 max-w-md text-base leading-relaxed">
          {isError
            ? "Votre paiement a bien été pris en compte, mais l’envoi automatique a échoué. Écrivez-nous à support@olala-degatdeseaux.fr avec votre nom — nous récupérons votre dossier."
            : "Cette page s’affiche après un paiement. Si vous avez un dossier en cours, reprenez-le depuis l’accueil."}
        </p>
        <div className="mt-8 flex justify-center">
          <BackLink href="/">Retour à l’accueil</BackLink>
        </div>
      </main>
    );
  }

  const prenom = done?.prenom;
  const email = done?.email;

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
          <div className="font-display mt-1 text-2xl tracking-wider">{done?.reference ?? "—"}</div>
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

      {/* Only claim an e-mail was sent when one actually was (AC-5). */}
      {done?.emailLive && (
        <m.p variants={item} className="text-muted-foreground mt-9 text-sm">
          Un e-mail de confirmation vient de vous être envoyé.
          <br />
          Une question ? Répondez simplement à cet e-mail.
        </m.p>
      )}
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

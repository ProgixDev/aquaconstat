"use client";

import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { useFunnelStore } from "../provider";

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
    <main className="bg-card rounded-panel shadow-panel mx-auto mt-6 w-full max-w-xl flex-1 px-6 pt-14 pb-16 text-center md:px-12">
      <div aria-hidden className="relative mx-auto size-30">
        <span className="border-aqua-bright/55 animate-droplet-ripple absolute inset-0 rounded-full border-[1.5px]" />
        <span className="border-aqua-bright/45 animate-droplet-ripple-alt absolute inset-0 rounded-full border-[1.5px]" />
        <span className="bg-info absolute inset-3.5 rounded-full" />
        <span className="rounded-droplet from-aqua-bright to-aqua absolute top-1/2 left-1/2 size-8 -translate-x-[52%] -translate-y-[58%] rotate-45 bg-linear-135" />
      </div>
      <h1 className="font-display mt-8 text-3xl font-bold md:text-4xl">
        {prenom ? `Merci ${prenom}, votre dossier est envoyé ✓` : "Votre dossier est envoyé ✓"}
      </h1>
      <div className="border-border-faint bg-card mt-5.5 inline-block rounded-lg border px-7 py-4">
        <div className="text-hint text-xs font-semibold tracking-widest uppercase">Référence</div>
        <div className="font-display mt-1 text-2xl tracking-wider">{reference ?? "—"}</div>
      </div>
      <p className="text-steel mx-auto mt-6 max-w-md text-base leading-relaxed">
        Vous recevrez votre devis par e-mail{" "}
        {email ? (
          <>
            à <strong className="text-foreground">{email}</strong>
          </>
        ) : (
          "à l’adresse indiquée dans votre dossier"
        )}{" "}
        sous 48 h ouvrées.
      </p>

      <div className="mx-auto mt-11 max-w-lg text-left">
        <div className="text-link text-center text-xs font-semibold tracking-[0.3em] uppercase">
          La suite
        </div>
        <div className="mt-5 flex flex-col">
          {suite.map((step, i) => (
            <div
              key={step.title}
              className={
                i < suite.length - 1
                  ? "border-border-faint flex gap-4 border-b py-3.5"
                  : "flex gap-4 py-3.5"
              }
            >
              <DropletGlyph size="md" className="mt-1" />
              <div>
                <div className="text-[15px] font-semibold">{step.title}</div>
                <div className="text-steel mt-1 text-sm">{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground mt-9 text-sm">
        Un e-mail de confirmation vient de vous être envoyé.
        <br />
        Une question ? Répondez simplement à cet e-mail.
      </p>
      <div className="mt-7">
        <Link href="/" className="text-link hover:text-link-hover text-sm font-semibold">
          ← Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { downscaleImage } from "@/lib/image";
import { startCheckout } from "../actions";
import { loadPhotos } from "../photo-storage";
import { useFunnelStore } from "../provider";
import type { PieceKey, SurfacePart } from "../types";
import { formatMissing, missingForPayment } from "../validation";
import { BackLink } from "./back-link";
import { ChoiceCard } from "./choice-card";
import { pieceNames } from "./questionnaire-form";
import { StepMeta } from "./step-shell";

const partOrder: SurfacePart[] = ["plaf", "murs", "sol"];
const partNames: Record<SurfacePart, string> = { plaf: "plafond", murs: "murs", sol: "sol" };

function useRecap() {
  const data = useFunnelStore((s) => s.data);
  const photoCount = useFunnelStore((s) => s.photos.filter((p) => p.status === "ok").length);

  const coordonnees =
    [[data.prenom, data.nom].filter(Boolean).join(" "), data.email, data.telephone]
      .filter(Boolean)
      .join(" · ") || "À compléter à l’étape 1";

  const typeLieuLabels = {
    maison: "maison individuelle",
    copro: "immeuble en copropriété",
    locatif: "immeuble locatif",
  } as const;
  const lieuParts = [
    data.adresse,
    data.batiment && `Bât. ${data.batiment}`,
    data.etage && `${data.etage} étage`,
    [data.codePostal, data.ville].filter(Boolean).join(" "),
  ].filter(Boolean);
  const lieu =
    lieuParts.length > 0
      ? `${lieuParts.join(", ")}${data.typeLieu ? ` — ${typeLieuLabels[data.typeLieu]}` : ""}`
      : "À compléter à l’étape 1";

  // « 2026-06-14 » → « 14/06/2026 ». Hand-rolled rather than toLocaleDateString
  // so the server and client can never disagree on the rendered string.
  const [y, m, d] = data.dateSinistre.split("-");
  const date = y && m && d ? `${d}/${m}/${y}` : "À compléter à l’étape 2";

  const selectedPieces = (Object.keys(pieceNames) as PieceKey[]).filter((k) => data.pieces[k]);
  const pieces =
    selectedPieces.length > 0
      ? selectedPieces
          .map((k) => {
            const room = data.surfaces[k];
            const parts = partOrder
              .filter((p) => room && p in room.parts)
              .map((p) => {
                const m2 = room?.parts[p];
                return m2 ? `${partNames[p]} ≈ ${m2} m²` : partNames[p];
              });
            const detail = parts.join(", ");
            return detail ? `${pieceNames[k]} (${detail})` : pieceNames[k];
          })
          .join(" · ")
      : "À compléter à l’étape 2";

  const photos =
    photoCount > 0
      ? `${photoCount} photo${photoCount > 1 ? "s" : ""} ajoutée${photoCount > 1 ? "s" : ""}`
      : "Aucune photo ajoutée";

  return { coordonnees, lieu, date, pieces, photos };
}

const recapRows = [
  { label: "Coordonnées", key: "coordonnees", href: "/dossier" },
  { label: "Lieu du sinistre", key: "lieu", href: "/dossier" },
  { label: "Date du sinistre", key: "date", href: "/dossier/questionnaire" },
  { label: "Pièces concernées", key: "pieces", href: "/dossier/questionnaire" },
  { label: "Photos", key: "photos", href: "/dossier/photos" },
] as const;

/** Étape 4 — récapitulatif + consentements, puis redirection vers le paiement. */
export function PaiementForm() {
  const recap = useRecap();
  const data = useFunnelStore((s) => s.data);
  const okPhotoCount = useFunnelStore((s) => s.photos.filter((p) => p.status === "ok").length);
  // A cancelled checkout returns here with ?canceled=1 — the dossier is intact.
  const canceled = useSearchParams().get("canceled") === "1";
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);
  // Vente à distance (client, 2026-07-16): the CGV acceptance and the
  // renonciation au droit de rétractation are two distinct express consents —
  // bundling them would weaken the waiver. Local state on purpose: consent is
  // gathered at the moment of payment, not carried over from a past visit.
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [retractationWaived, setRetractationWaived] = useState(false);
  // Last line of defence: the step CTAs already gate progression, but the
  // payment page is reachable by direct URL. Charging 82,90 € for a dossier
  // that can't be quoted is the one failure we must never allow.
  const incomplete = missingForPayment(data, okPhotoCount);
  const canPay = cgvAccepted && retractationWaived && incomplete.length === 0 && !starting;

  const pay = async () => {
    setError(false);
    setStarting(true);
    try {
      // Send the whole dossier + its photos NOW, so it is persisted server-side
      // before the visitor leaves for Stripe — a closed tab can no longer lose
      // anything. Photos are downscaled here so the upload stays quick.
      const form = new FormData();
      form.set("dossier", JSON.stringify(data));
      const stored = await loadPhotos();
      const meta: { name: string; takenAt: string | null }[] = [];
      for (const photo of stored) {
        if (!photo.blob) continue;
        const small = await downscaleImage(
          new File([photo.blob], photo.name, { type: photo.blob.type }),
        );
        form.append("photos", small, photo.name);
        meta.push({ name: photo.name, takenAt: photo.takenAt });
      }
      form.set("photosMeta", JSON.stringify(meta));

      // The card itself is collected on Stripe's hosted page (or the demo
      // stand-in) — never here. A full navigation, since the URL is external
      // when Stripe is live.
      const { url } = await startCheckout(form);
      window.location.assign(url);
    } catch {
      setError(true);
      setStarting(false);
    }
  };

  return (
    <>
      <BackLink href="/dossier/photos">Retour aux photos</BackLink>
      <h1 className="font-display mt-4.5 text-3xl font-bold md:text-[34px]">Vérifiez et payez</h1>
      <StepMeta step={4} />

      <section className="mt-8">
        <h2 className="font-display text-ink-soft text-lg font-bold">Récapitulatif</h2>
        <div className="border-border-faint bg-card mt-4 overflow-hidden rounded-xl border">
          {recapRows.map((row, i) => (
            <div
              key={row.key}
              className={
                i < recapRows.length - 1
                  ? "border-border-soft flex flex-wrap justify-between gap-4 border-b px-5 py-4"
                  : "flex flex-wrap justify-between gap-4 px-5 py-4"
              }
            >
              <div>
                <div className="text-hint text-xs font-semibold tracking-wider uppercase">
                  {row.label}
                </div>
                <div className="mt-1 text-sm leading-relaxed">{recap[row.key]}</div>
              </div>
              <Link
                href={row.href}
                className="text-link hover:text-link-hover self-center text-sm font-semibold"
              >
                Modifier
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-11">
        <h2 className="font-display text-ink-soft text-lg font-bold">Paiement</h2>
        <div className="border-border-faint bg-card mt-4 rounded-xl border px-6 pt-6 pb-7">
          <div className="text-ink-soft border-border-soft flex justify-between gap-4 border-b pb-3.5 text-sm">
            <span>Étude du dossier &amp; devis détaillé</span>
            <span className="text-foreground font-semibold">82,90 €</span>
          </div>
          <div className="flex justify-between gap-4 pt-3.5 text-base font-semibold">
            <span>Total</span>
            <span>82,90 € TTC</span>
          </div>

          {/* The card is entered on Stripe's own secure page, opened when you
              click « Payer » — Ôlala never sees or stores it. */}
          <div className="border-border-faint bg-paper mt-5.5 flex items-start gap-3 rounded-md border p-4.5">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-link mt-0.5 size-5 flex-none"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="text-steel text-sm leading-relaxed">
              Le paiement s’effectue sur la page sécurisée de{" "}
              <span className="text-ink-soft font-semibold">Stripe</span>. Votre carte n’est jamais
              vue ni conservée par Ôlala.
            </div>
          </div>

          {canceled && (
            <div className="border-border-faint bg-info mt-4 rounded-md border px-4.5 py-4">
              <div className="text-info-foreground text-sm font-semibold">
                Paiement interrompu — aucun montant n’a été débité.
              </div>
              <p className="text-info-foreground/80 mt-1.5 text-sm leading-relaxed">
                Votre dossier est conservé. Vous pouvez réessayer quand vous voulez.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive-soft mt-4 rounded-md border-[1.5px] px-4.5 py-4"
            >
              <div className="text-destructive text-sm font-semibold">
                L’envoi de vos photos a échoué.
              </div>
              <p className="text-destructive/80 mt-1.5 text-sm leading-relaxed">
                Vérifiez votre connexion et réessayez — vos photos et vos réponses sont conservées
                sur cet appareil.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2.5">
            <ChoiceCard
              checkbox
              selected={cgvAccepted}
              onClick={() => setCgvAccepted(!cgvAccepted)}
            >
              J’accepte les Conditions Générales de Vente.
            </ChoiceCard>
            <ChoiceCard
              checkbox
              selected={retractationWaived}
              onClick={() => setRetractationWaived(!retractationWaived)}
            >
              Je demande l’exécution immédiate de la prestation et je renonce expressément à mon
              droit de rétractation de 14 jours pour que mon devis soit traité et livré sous 48 h.
            </ChoiceCard>
          </div>

          {incomplete.length > 0 && (
            <div className="border-border-faint bg-info mt-5 rounded-md border px-4.5 py-4">
              <div className="text-info-foreground text-sm font-semibold">
                Votre dossier est incomplet
              </div>
              <p className="text-info-foreground/80 mt-1.5 text-sm leading-relaxed">
                Avant le paiement, il manque {formatMissing(incomplete)}. Revenez à l’étape
                concernée : vos réponses sont conservées.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={pay}
            disabled={!canPay}
            className="bg-primary text-primary-foreground shadow-cta-sm mt-5 flex w-full cursor-pointer justify-center rounded-full px-8 py-4.5 font-sans text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? "Envoi de vos photos…" : "Payer 82,90 € et envoyer mon dossier"}
          </button>
          {/* Every other step explains why its CTA is blocked; the one screen
              where money is at stake used to just grey out silently. */}
          {incomplete.length === 0 && !canPay && !starting && (
            <p role="status" className="text-hint mt-3 text-center text-xs leading-relaxed">
              Pour payer, cochez les deux cases ci-dessus : l’acceptation des CGV et la demande
              d’exécution immédiate.
            </p>
          )}
          {/* Accurate about WHEN data moves: the photos are uploaded before the
              redirect, so promising nothing leaves before payment was false. */}
          <p className="text-hint mt-4 text-center text-xs leading-relaxed">
            Vos photos sont envoyées de façon sécurisée avant le paiement, puis transmises à
            l’artisan une fois le paiement confirmé.
          </p>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Paiement sécurisé par Stripe — votre carte n’est jamais stockée par Ôlala.
          </p>
        </div>
      </section>
    </>
  );
}

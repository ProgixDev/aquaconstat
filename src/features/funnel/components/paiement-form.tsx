"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFunnelStore } from "../provider";
import type { PieceKey, SurfacePart } from "../types";
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
    maison: "maison particulière",
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
            const parts = partOrder.filter((p) => room?.[p]).map((p) => partNames[p]);
            const detail = [parts.join(", "), room?.surfaceM2 ? `≈ ${room.surfaceM2} m²` : ""]
              .filter(Boolean)
              .join(" · ");
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

/** Étape 4 — récapitulatif + carte (painted-door Stripe, spec 003 AC-6). */
export function PaiementForm() {
  const router = useRouter();
  const recap = useRecap();
  const submitPayment = useFunnelStore((s) => s.submitPayment);
  const [declined] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  // Vente à distance (client, 2026-07-16): the CGV acceptance and the
  // renonciation au droit de rétractation are two distinct express consents —
  // bundling them would weaken the waiver. Local state on purpose: consent is
  // gathered at the moment of payment, not carried over from a past visit.
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [retractationWaived, setRetractationWaived] = useState(false);
  const canPay = cgvAccepted && retractationWaived;

  const pay = () => {
    submitPayment();
    router.push("/confirmation");
  };

  return (
    <>
      <Link href="/dossier/photos" className="text-muted-foreground hover:text-foreground text-sm">
        ← Retour aux photos
      </Link>
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

          <div className="border-border-faint bg-paper mt-5.5 rounded-md border p-4.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-hint text-xs font-semibold tracking-widest uppercase">
                Carte bancaire
              </span>
              <span className="text-muted-foreground text-xs">
                Powered by <span className="text-ink-soft font-semibold">Stripe</span>
              </span>
            </div>
            <div className="mt-3.5 flex flex-col gap-3">
              <label className="text-steel flex flex-col gap-1.5 text-xs font-semibold">
                Numéro de carte
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 1234 1234 1234"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="border-input bg-paper text-foreground rounded-sm border px-3.5 py-3 font-sans text-base tracking-wide"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-steel flex flex-col gap-1.5 text-xs font-semibold">
                  Expiration
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM / AA"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="border-input bg-paper text-foreground rounded-sm border px-3.5 py-3 font-sans text-base"
                  />
                </label>
                <label className="text-steel flex flex-col gap-1.5 text-xs font-semibold">
                  CVC
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="border-input bg-paper text-foreground rounded-sm border px-3.5 py-3 font-sans text-base"
                  />
                </label>
              </div>
            </div>
          </div>

          {declined && (
            <div className="border-destructive/30 bg-destructive-soft mt-4 rounded-md border-[1.5px] px-4.5 py-4">
              <div className="text-destructive text-sm font-semibold">
                Votre banque a refusé le paiement.
              </div>
              <p className="text-destructive/80 mt-1.5 text-sm leading-relaxed">
                Aucun montant n’a été débité. Vérifiez le numéro de carte ou essayez une autre carte
                — votre dossier est conservé, rien n’est perdu.
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

          <button
            type="button"
            onClick={pay}
            disabled={!canPay}
            className="bg-primary text-primary-foreground shadow-cta-sm mt-5 flex w-full cursor-pointer justify-center rounded-full px-8 py-4.5 font-sans text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {declined ? "Réessayer le paiement — 82,90 €" : "Payer 82,90 € et envoyer mon dossier"}
          </button>
          <p className="text-hint mt-4 text-center text-xs leading-relaxed">
            Votre dossier n’est transmis qu’une fois le paiement confirmé.
          </p>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Paiement sécurisé par Stripe — votre carte n’est jamais stockée par Ôlala.
          </p>
        </div>
      </section>
    </>
  );
}

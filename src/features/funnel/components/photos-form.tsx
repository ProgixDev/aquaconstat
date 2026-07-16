"use client";

import Link from "next/link";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { useFunnelStore } from "../provider";
import { ContinueCta } from "./continue-cta";
import { StepMeta } from "./step-shell";

/** Client copy, 2026-07-16 — two shots, each with the reason it matters. */
const consignes = [
  {
    lead: "De loin",
    text: "Une vue générale de chaque pièce touchée (pour voir le volume).",
  },
  {
    lead: "De près",
    text: "Les zones endommagées (murs, plafond, sol) pour bien voir les détails des dégâts.",
  },
] as const;

const MAX_SIZE = 20 * 1024 * 1024;

/** Étape 3 — consignes, upload dropzone, preview grid with error state. */
export function PhotosForm() {
  const photos = useFunnelStore((s) => s.photos);
  const addPhotos = useFunnelStore((s) => s.addPhotos);
  const removePhoto = useFunnelStore((s) => s.removePhoto);
  const retryPhoto = useFunnelStore((s) => s.retryPhoto);

  const okCount = photos.filter((p) => p.status === "ok").length;

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addPhotos(
      files.map((f) => ({
        name: f.name,
        url: f.size > MAX_SIZE ? "" : URL.createObjectURL(f),
        tooLarge: f.size > MAX_SIZE,
      })),
    );
    e.target.value = "";
  };

  return (
    <>
      <Link
        href="/dossier/questionnaire"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Retour au questionnaire
      </Link>
      <h1 className="font-display mt-4.5 text-3xl font-bold md:text-[34px]">Ajoutez vos photos</h1>
      <StepMeta step={3} />
      <p className="text-steel mt-3.5 max-w-2xl text-base leading-relaxed">
        Elles permettront à l’artisan de chiffrer précisément les travaux sans se déplacer. Ne vous
        inquiétez pas pour la qualité : de simples photos avec votre téléphone suffisent largement.
      </p>

      <div className="bg-info mt-5.5 rounded-lg px-5.5 py-4.5">
        <div className="text-link text-xs font-semibold tracking-widest uppercase">
          Consignes de prise de vue (comptez 4 à 8 photos)
        </div>
        <ul className="text-info-foreground mt-3 flex flex-col gap-2.5 text-sm">
          {consignes.map((c) => (
            <li key={c.lead} className="flex items-start gap-2.5">
              <DropletGlyph className="mt-1.5" />
              <span>
                <strong className="font-semibold">{c.lead} :</strong> {c.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <label className="border-aqua/50 bg-paper hover:border-link mt-5.5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed px-6 py-8 text-center">
        <DropletGlyph size="lg" />
        <span className="text-foreground text-base font-semibold">
          Depuis la galerie ou l’appareil photo
        </span>
        <span className="text-muted-foreground text-xs">
          Formats acceptés : JPG, PNG ou HEIC · 20 Mo max par photo
        </span>
        <input type="file" accept="image/*" multiple onChange={onFiles} className="sr-only" />
      </label>

      <ul className="mt-5.5 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id} className="flex flex-col gap-2">
            {photo.status === "error" ? (
              <div className="border-destructive/30 bg-destructive-soft flex aspect-4/3 w-full flex-col items-center justify-center gap-1.5 rounded-md border-[1.5px] p-3 text-center">
                <span className="text-destructive font-mono text-[10px]">{photo.name}</span>
                <span className="text-destructive text-xs leading-snug font-semibold">
                  Fichier trop lourd (20 Mo max)
                </span>
                <span className="text-destructive/80 text-xs leading-snug">
                  Réessayez en qualité réduite depuis votre téléphone.
                </span>
                <button
                  type="button"
                  onClick={() => retryPhoto(photo.id)}
                  className="border-destructive/60 bg-paper text-destructive mt-0.5 cursor-pointer rounded-full border px-3.5 py-1.5 font-sans text-xs font-semibold"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                {/* Object URLs from the visitor's device — next/image can't optimize blob: URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="border-border-faint aspect-4/3 w-full rounded-md border object-cover"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="from-aqua-bright to-aqua h-1 flex-1 rounded-full bg-linear-90" />
                  <span className="text-success text-xs font-semibold whitespace-nowrap">
                    Téléchargée
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(photo.url);
                    removePhoto(photo.id);
                  }}
                  className="text-muted-foreground cursor-pointer self-start border-none bg-transparent p-0 font-sans text-xs underline"
                >
                  Supprimer
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="text-muted-foreground mt-4 text-sm">
        {okCount} {okCount > 1 ? "photos ajoutées" : "photo ajoutée"}
      </div>
      <p className="text-hint mt-1 text-xs">
        Au moins 1 photo est requise pour passer à l’étape suivante.
      </p>

      <ContinueCta href="/dossier/paiement">Continuer vers le paiement</ContinueCta>
    </>
  );
}

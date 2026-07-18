"use client";

import Link from "next/link";
import { AnimatePresence, listItem, m } from "@/components/motion";
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

      <div className="border-aqua/50 bg-paper mt-5.5 flex flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed px-6 py-8 text-center">
        <DropletGlyph size="lg" />
        {/* Camera-first (client UX request, 2026-07-18): on smartphones,
            `capture="environment"` opens the native camera directly on the
            rear lens — no gallery digging, the « sur photo » promise made
            instant. Desktop browsers ignore `capture` and fall back to the
            file dialog, so the same control serves both. */}
        <label className="bg-primary text-primary-foreground shadow-cta-sm inline-flex cursor-pointer items-center gap-2.5 rounded-full px-6 py-3 text-base font-semibold transition-transform hover:-translate-y-0.5">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 flex-none"
          >
            <path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5l-2-3Z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          Prendre une photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFiles}
            className="sr-only"
          />
        </label>
        {/* Gallery fallback — `capture` locks an input to the camera, so the
            photos already in the visitor's gallery need their own input. */}
        <label className="text-link hover:text-link-hover cursor-pointer text-sm font-semibold underline decoration-1 underline-offset-4">
          ou choisir dans la galerie
          <input type="file" accept="image/*" multiple onChange={onFiles} className="sr-only" />
        </label>
        <span className="text-muted-foreground text-xs">
          Formats acceptés : JPG, PNG ou HEIC · 20 Mo max par photo
        </span>
      </div>

      {/* Thumbnails spring in as they land and fade out on delete; `layout`
          lets the grid close the gap smoothly instead of snapping. */}
      <ul className="mt-5.5 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {photos.map((photo) => (
            <m.li
              key={photo.id}
              layout
              initial={listItem.initial}
              animate={listItem.animate}
              exit={listItem.exit}
              transition={listItem.transition}
              className="flex flex-col gap-2"
            >
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
            </m.li>
          ))}
        </AnimatePresence>
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

"use client";

import { AnimatePresence, listItem, m } from "@/components/motion";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { readCaptureDate } from "@/lib/exif";
import { useFunnelStore } from "../provider";
import { BackLink } from "./back-link";
import { ChoiceCard } from "./choice-card";
import { ContinueCta } from "./continue-cta";
import { StepMeta } from "./step-shell";
import { missingForPhotos } from "../validation";

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

/** « 2026-07-18T14:23:05 » → « 18/07/2026 à 14 h 23 ». Hand-rolled rather than
 *  toLocaleString so server and client can never disagree on the string. */
function formatCapture(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;
  return `${d}/${mo}/${y} à ${h} h ${mi}`;
}

/**
 * Étape 3 — consignes, live capture, preview grid with error state.
 *
 * Camera only (client, 2026-07-18): the gallery route is gone, so every photo
 * is shot on the spot. Its EXIF `DateTimeOriginal` is read on the device and
 * kept with the dossier — the visitor never types a date for the photos.
 */
export function PhotosForm() {
  const photos = useFunnelStore((s) => s.photos);
  const addPhotos = useFunnelStore((s) => s.addPhotos);
  const removePhoto = useFunnelStore((s) => s.removePhoto);
  const retryPhoto = useFunnelStore((s) => s.retryPhoto);
  const attested = useFunnelStore((s) => s.data.photosAttestation);
  const setField = useFunnelStore((s) => s.setField);

  const okCount = photos.filter((p) => p.status === "ok").length;

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset before awaiting, so the same shot can be retaken
    const prepared = await Promise.all(
      files.map(async (f) => {
        const tooLarge = f.size > MAX_SIZE;
        // The store keeps the Blob (IndexedDB) and mints the preview URL.
        return {
          name: f.name,
          blob: f,
          tooLarge,
          takenAt: tooLarge ? null : await readCaptureDate(f),
        };
      }),
    );
    addPhotos(prepared);
  };

  return (
    <>
      <BackLink href="/dossier/questionnaire">Retour au questionnaire</BackLink>
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
            file dialog, where `multiple` lets several be picked at once. On
            mobile the visitor taps the button once per shot — reason the label
            switches to « une autre photo » after the first. */}
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
          {okCount > 0 ? "Prendre une autre photo" : "Prendre une photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={onFiles}
            className="sr-only"
          />
        </label>
        <span className="text-muted-foreground max-w-sm text-xs leading-relaxed">
          Prenez plusieurs photos, sur place et maintenant : la date et l’heure de prise de vue sont
          enregistrées automatiquement avec votre dossier. Reprenez le bouton pour chaque cliché.
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
                  {/* Proof the shot is live — read from the file, never typed. */}
                  {photo.takenAt && formatCapture(photo.takenAt) && (
                    <div className="text-hint text-[11px] leading-snug">
                      Prise le {formatCapture(photo.takenAt)}
                    </div>
                  )}
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

      {/* Honour declaration (client, 2026-07-21) — live capture can't be
          guaranteed on every device, so the visitor attests the photos are
          genuine and just taken. Required before payment. */}
      <div className="mt-6">
        <ChoiceCard
          checkbox
          selected={attested}
          onClick={() => setField("photosAttestation", !attested)}
        >
          Je déclare sur l’honneur que ces photos ont été prises par mes soins, sur le lieu du
          sinistre, et qu’elles reflètent fidèlement l’état réel des dégâts constatés.
        </ChoiceCard>
      </div>

      <ContinueCta href="/dossier/paiement" missing={missingForPhotos(okCount, attested)}>
        Continuer vers le paiement
      </ContinueCta>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { formatFrDateTime, formatFrShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { setDossierStatut } from "../actions";
import type { DossierDetail as DossierDetailData, DossierStatut } from "../data";
import { slaState } from "../sla";
import { SlaPill } from "./sla-pill";
import { StatusBadge } from "./status-badge";

const statuts: DossierStatut[] = ["En attente", "Devis envoyé"];

type Photo = DossierDetailData["photos"][number];

/**
 * Force a download with a chosen filename.
 *
 * The `download` attribute is only honoured SAME-ORIGIN, so it works for the
 * simulation's /public/mock paths but would silently open a tab for the signed
 * Supabase URLs used in production. Supabase serves an object as an attachment
 * when asked with `?download=<name>`, so remote URLs get that instead — the
 * signature covers the path, not the query, so adding it stays valid.
 */
function downloadHref(src: string, filename: string): string {
  if (!/^https?:\/\//i.test(src)) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}download=${encodeURIComponent(filename)}`;
}

function triggerDownload(src: string, filename: string) {
  const a = document.createElement("a");
  a.href = downloadHref(src, filename);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

type FactsProps = {
  rows: { label: string; value: string }[];
  strongFirst?: boolean;
};

function Facts({ rows, strongFirst = false }: FactsProps) {
  return (
    // minmax(0,1fr): without it the value column floors at the min-content of an
    // unbreakable token (camille.moreau@gmail.com ≈ 173px) and pushes the whole
    // card past a 320px screen. break-words then wraps those tokens. Narrower
    // label column on mobile buys the value more room.
    <div className="mt-4 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[9rem_1fr]">
      {rows.map((row, i) => (
        <div key={row.label} className="contents">
          <span className="text-hint">{row.label}</span>
          <span className={cn("break-words", strongFirst && i === 0 && "font-semibold")}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-border-faint bg-card rounded-lg border px-6 py-5.5">
      <h2 className="font-display text-ink-soft text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

type DossierDetailProps = {
  dossier: DossierDetailData;
  /** Server render time, so the deadline reads the same on both sides. */
  now: number;
};

/** Dossier detail — record cards, status switcher, photo grid + lightbox (spec 004, AC-3). */
export function DossierDetail({ dossier, now }: DossierDetailProps) {
  const [statut, setStatut] = useState<DossierStatut>(dossier.statut);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [statutError, setStatutError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  /**
   * Optimistic, then reconciled: the pill flips immediately, and rolls back with
   * a reason if the server refuses (e.g. « Devis envoyé » on an unpaid dossier).
   * Before spec 006 this was local state only — it forgot on reload.
   */
  const changeStatut = (next: DossierStatut) => {
    if (next === statut || saving) return;
    const previous = statut;
    setStatut(next);
    setStatutError(null);
    startSaving(async () => {
      const result = await setDossierStatut(dossier.ref, next);
      if (!result.ok) {
        setStatut(previous);
        setStatutError(
          result.error === "unpaid"
            ? "Ce dossier n’est pas payé : le devis ne peut pas être marqué envoyé."
            : "La mise à jour n’a pas pu être enregistrée.",
        );
      }
    });
  };

  // Name downloads by the dossier so a pro's Downloads folder stays sorted:
  // AC-2026-0147-02-plafond.jpg. The query string is stripped first — a signed
  // URL would otherwise drag its whole token into the filename.
  const fileName = (photo: Photo) => {
    const last = photo.src.split("?")[0]!.split("/").pop() || "photo.jpg";
    return `${dossier.ref}-${decodeURIComponent(last)}`;
  };
  const downloadOne = (photo: Photo) => triggerDownload(photo.src, fileName(photo));
  // Staggered so the browser doesn't drop rapid-fire programmatic downloads.
  // A single zip would be nicer, but that needs a dependency; this stays
  // no-dep and works for the handful of photos a dossier carries.
  const downloadAll = () => {
    dossier.photos.forEach((photo, i) => {
      window.setTimeout(() => downloadOne(photo), i * 300);
    });
  };

  // The deadline follows the dossier: this is the page Nino works from, so the
  // « en retard de 3 h » has to be here too, not only in the list.
  const sla = slaState(now, {
    paidAtMs: dossier.paidAt ? new Date(dossier.paidAt).getTime() : null,
    sent: statut === "Devis envoyé",
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-7 pb-16 md:px-12">
      <Link href="/admin/dossiers" className="text-muted-foreground hover:text-foreground text-sm">
        ← Dossiers reçus
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3.5">
        <h1 className="font-display text-2xl font-bold tracking-wide">{dossier.ref}</h1>
        <span className="text-base font-semibold">{dossier.nom}</span>
        <span className="text-muted-foreground text-sm">
          créé le {formatFrShortDate(dossier.createdAt)}
        </span>
        <StatusBadge paye={dossier.paidAt !== null} />
        <SlaPill state={sla} />
        <div
          role="radiogroup"
          aria-label="Statut du dossier"
          className="flex w-full flex-wrap items-center gap-x-2.5 gap-y-2 sm:ml-auto sm:w-auto sm:flex-nowrap"
        >
          <span className="text-hint text-xs font-semibold tracking-wider uppercase">Statut</span>
          <div className="flex flex-wrap gap-1.5">
            {statuts.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={statut === s}
                disabled={saving}
                onClick={() => changeStatut(s)}
                className={cn(
                  "border-input bg-paper text-ink-soft cursor-pointer rounded-full border px-3.5 py-2 font-sans text-xs font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60",
                  statut === s && "ring-aqua ring-2",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      {statutError && (
        <p role="status" className="text-destructive mt-2 text-right text-xs">
          {statutError}
        </p>
      )}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <SectionCard title="Coordonnées & lieu du sinistre">
          <Facts
            strongFirst
            rows={[
              { label: "Nom", value: dossier.nom },
              { label: "E-mail", value: dossier.email },
              { label: "Téléphone", value: dossier.telephone },
              { label: "Adresse", value: dossier.adresse },
              { label: "Bâtiment", value: dossier.batiment },
              { label: "Demandeur", value: dossier.demandeur },
              { label: "Syndic / gérant", value: dossier.syndic },
            ]}
          />
        </SectionCard>
        <div className="flex flex-col gap-5">
          {/* « Assurance » card removed 2026-07-16 — the funnel no longer asks
              for any of it, so the pro can never be shown it. */}
          <SectionCard title="Paiement">
            <div className="mt-4 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[9rem_1fr]">
              <span className="text-hint">Montant</span>
              <span className="font-semibold">82,90 €</span>
              <span className="text-hint">Date</span>
              <span>{dossier.paidAt ? formatFrDateTime(dossier.paidAt) : "—"}</span>
              <span className="text-hint">Statut Stripe</span>
              <span>
                {dossier.paidAt ? (
                  <span className="bg-success-soft text-success-strong inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    succeeded · Payé ✓
                  </span>
                ) : (
                  <span className="bg-destructive/10 text-destructive inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    failed · Échoué
                  </span>
                )}
              </span>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Réponses au questionnaire">
        <div className="mt-4.5 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="text-link text-xs font-semibold tracking-wider uppercase">
              Le sinistre
            </div>
            <Facts rows={dossier.sinistre} />
          </div>
          <div>
            <div className="text-link text-xs font-semibold tracking-wider uppercase">
              Travaux par pièce
            </div>
            <Facts rows={dossier.surfaces} />
          </div>
        </div>
      </SectionCard>

      <section className="border-border-faint bg-card mt-5 rounded-lg border px-6 py-5.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-ink-soft text-sm font-bold">
            Photos — {dossier.photos.length}
          </h2>
          <button
            type="button"
            onClick={downloadAll}
            className="border-input bg-paper text-link hover:border-aqua cursor-pointer rounded-full border px-4.5 py-2 font-sans text-sm font-semibold transition-colors"
          >
            Tout télécharger
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {dossier.photos.map((photo) => (
            <li key={photo.src} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setLightbox(photo)}
                aria-label={`Agrandir — ${photo.label}`}
                className="border-border-faint bg-muted group relative aspect-4/3 cursor-zoom-in overflow-hidden rounded-md border"
              >
                <Image
                  src={photo.src}
                  alt={photo.label}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  // Dossier photos are SIGNED, short-lived URLs on the Supabase
                  // host. Unoptimized on purpose: it avoids allow-listing a
                  // hostname that changes per project, and keeps private photos
                  // out of Next's image cache, which would serve them from our
                  // own origin long after the signature expired.
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
              <div className="flex items-center justify-between gap-2">
                <span className="text-hint truncate text-xs" title={photo.label}>
                  {photo.label}
                </span>
                <button
                  type="button"
                  onClick={() => downloadOne(photo)}
                  className="text-link hover:text-navy shrink-0 cursor-pointer border-none bg-transparent p-0 font-sans text-xs font-semibold underline"
                >
                  Télécharger
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.label}
          onClick={() => setLightbox(null)}
          className="bg-navy/85 fixed inset-0 z-[60] flex cursor-zoom-out flex-col items-center justify-center gap-4 p-6 backdrop-blur-sm"
        >
          <div className="bg-navy-deep relative aspect-4/3 w-[min(62rem,94vw)] overflow-hidden rounded-xl shadow-2xl">
            <Image
              src={lightbox.src}
              alt={lightbox.label}
              fill
              sizes="94vw"
              unoptimized
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="text-secondary-foreground text-sm font-semibold">
              {lightbox.label}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadOne(lightbox);
              }}
              className="bg-primary text-primary-foreground shadow-cta-sm cursor-pointer rounded-full px-4 py-1.5 font-sans text-sm font-semibold"
            >
              Télécharger
            </button>
          </div>
          <span className="text-aqua-pale/70 text-xs">cliquez n’importe où pour fermer</span>
        </div>
      )}
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DossierDetail as DossierDetailData, DossierStatut } from "../data";
import { StatusBadge } from "./status-badge";

const statuts: DossierStatut[] = ["Nouveau", "En cours", "Devis envoyé"];

type FactsProps = {
  rows: { label: string; value: string }[];
  strongFirst?: boolean;
};

function Facts({ rows, strongFirst = false }: FactsProps) {
  return (
    <div className="mt-4 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2.5 text-sm">
      {rows.map((row, i) => (
        <div key={row.label} className="contents">
          <span className="text-hint">{row.label}</span>
          <span className={cn(strongFirst && i === 0 && "font-semibold")}>{row.value}</span>
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
};

/** Dossier detail — record cards, status switcher, photo grid + lightbox (spec 004, AC-3). */
export function DossierDetail({ dossier }: DossierDetailProps) {
  const [statut, setStatut] = useState<DossierStatut>(dossier.statut);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-7 pb-16 md:px-12">
      <Link href="/admin/dossiers" className="text-muted-foreground hover:text-foreground text-sm">
        ← Dossiers reçus
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3.5">
        <h1 className="font-display text-2xl font-bold tracking-wide">{dossier.ref}</h1>
        <span className="text-base font-semibold">{dossier.nom}</span>
        <span className="text-muted-foreground text-sm">créé le {dossier.date}</span>
        <StatusBadge paye={dossier.paye} />
        <div
          role="radiogroup"
          aria-label="Statut du dossier"
          className="ml-auto flex items-center gap-2.5"
        >
          <span className="text-hint text-xs font-semibold tracking-wider uppercase">Statut</span>
          <div className="flex gap-1.5">
            {statuts.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={statut === s}
                onClick={() => setStatut(s)}
                className={cn(
                  "border-input bg-paper text-ink-soft cursor-pointer rounded-full border px-3.5 py-2 font-sans text-xs font-semibold",
                  statut === s && "ring-aqua ring-2",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

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
              { label: "Usage", value: dossier.usage },
              { label: "Demandeur", value: dossier.demandeur },
              { label: "Propriétaire", value: dossier.proprietaire },
              { label: "Syndic / gérant", value: dossier.syndic },
            ]}
          />
        </SectionCard>
        <div className="flex flex-col gap-5">
          <SectionCard title="Assurance">
            <Facts
              strongFirst
              rows={[
                { label: "Assureur", value: dossier.assureur },
                { label: "N° de contrat", value: dossier.numeroContrat },
                { label: "N° de sinistre", value: dossier.numeroSinistre },
                { label: "Agent / courtier", value: dossier.agent },
              ]}
            />
          </SectionCard>
          <SectionCard title="Paiement">
            <div className="mt-4 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2.5 text-sm">
              <span className="text-hint">Montant</span>
              <span className="font-semibold">149,00 €</span>
              <span className="text-hint">Date</span>
              <span>{dossier.paiementDate}</span>
              <span className="text-hint">Statut Stripe</span>
              <span>
                <span className="bg-success-soft text-success-strong inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  succeeded · Payé ✓
                </span>
              </span>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Réponses au questionnaire">
        <div className="mt-4.5 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="text-link text-xs font-semibold tracking-wider uppercase">
              A · Le sinistre
            </div>
            <Facts rows={dossier.sinistre} />
          </div>
          <div>
            <div className="text-link text-xs font-semibold tracking-wider uppercase">
              B · Surfaces endommagées
            </div>
            <Facts rows={dossier.surfaces} />
            <div className="text-link mt-5.5 text-xs font-semibold tracking-wider uppercase">
              C · État des éléments
            </div>
            <Facts rows={dossier.etats} />
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
            className="border-input bg-paper text-link cursor-pointer rounded-full border px-4.5 py-2 font-sans text-sm font-semibold"
          >
            Tout télécharger
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {dossier.photos.map((label) => (
            <li key={label} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setLightbox(label)}
                className="border-border-faint bg-photo-placeholder flex aspect-4/3 cursor-zoom-in items-end justify-center rounded-md border p-0 pb-2.5"
              >
                <span className="text-muted-foreground font-mono text-[10px] tracking-wide">
                  {label}
                </span>
              </button>
              <button
                type="button"
                className="text-link cursor-pointer self-start border-none bg-transparent p-0 font-sans text-xs underline"
              >
                Télécharger
              </button>
            </li>
          ))}
        </ul>
      </section>

      {lightbox && (
        <div
          role="dialog"
          aria-label={lightbox}
          onClick={() => setLightbox(null)}
          className="bg-navy/80 fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center p-8"
        >
          <div className="bg-photo-placeholder flex aspect-4/3 w-[min(54rem,92vw)] flex-col items-center justify-center gap-2.5 rounded-xl shadow-2xl">
            <span className="text-ink-soft font-mono text-sm">{lightbox}</span>
            <span className="text-muted-foreground text-xs">cliquez n’importe où pour fermer</span>
          </div>
        </div>
      )}
    </main>
  );
}

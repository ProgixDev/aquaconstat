"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { dossiers, type DossierStatut } from "../data";
import { StatusBadge } from "./status-badge";

const filters: ("tous" | DossierStatut)[] = ["tous", "Nouveau", "En cours", "Devis envoyé"];

/** Dossiers list — search, status filters, badge table, designed empty states. */
export function DossiersTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"tous" | DossierStatut>("tous");

  const q = query.trim().toLowerCase();
  const filtered = dossiers.filter(
    (d) =>
      (filter === "tous" || d.statut === filter) &&
      (!q || d.nom.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q)),
  );

  return (
    <>
      <div className="mt-5.5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher par nom ou référence…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher par nom ou référence"
          className="border-input bg-field text-foreground max-w-sm flex-1 basis-72 rounded-sm border px-4 py-3 font-sans text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "border-input bg-paper text-ink-soft cursor-pointer rounded-full border px-4 py-2.5 font-sans text-sm font-semibold",
                filter === f && "ring-aqua ring-2",
              )}
            >
              {f === "tous" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="border-border-faint bg-card mt-5 overflow-x-auto rounded-lg border">
          <div className="min-w-[55rem]">
            <div className="border-border-faint text-hint grid grid-cols-[8rem_1.4fr_1fr_8rem_7.5rem_9.5rem] gap-3.5 border-b px-5 py-3 text-xs font-semibold tracking-wider uppercase">
              <span>Référence</span>
              <span>Demandeur</span>
              <span>Ville</span>
              <span>Créé le</span>
              <span>Paiement</span>
              <span>Statut</span>
            </div>
            {filtered.map((d) => (
              <Link
                key={d.ref}
                href={`/admin/dossiers/${d.ref}`}
                className="border-border-soft text-foreground hover:bg-muted grid grid-cols-[8rem_1.4fr_1fr_8rem_7.5rem_9.5rem] items-center gap-3.5 border-b px-5 py-3.5 text-sm last:border-b-0"
              >
                <span className="text-ink-soft font-mono text-xs">{d.ref}</span>
                <span className="font-semibold">{d.nom}</span>
                <span className="text-steel">{d.ville}</span>
                <span className="text-steel text-sm">{d.date}</span>
                <span>
                  <StatusBadge paye={d.paye} />
                </span>
                <span>
                  <StatusBadge statut={d.statut} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && !q && (
        <div className="border-input bg-paper mt-5 rounded-lg border border-dashed px-6 py-14 text-center">
          <DropletGlyph size="lg" inactive />
          <p className="text-steel mx-auto mt-3.5 max-w-md text-sm leading-relaxed">
            Aucun dossier pour le moment — les dossiers apparaîtront ici dès la première commande
            payée.
          </p>
        </div>
      )}

      {filtered.length === 0 && q && (
        <div className="border-input bg-paper mt-5 rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-steel text-sm">Aucun résultat pour « {query} ».</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("tous");
            }}
            className="border-input bg-paper text-link mt-3 cursor-pointer rounded-full border px-4.5 py-2 font-sans text-sm font-semibold"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      <div className="text-hint mt-3.5 text-xs">
        {filtered.length} dossier{filtered.length > 1 ? "s" : ""} · cliquez sur une ligne pour
        ouvrir le détail
      </div>
    </>
  );
}

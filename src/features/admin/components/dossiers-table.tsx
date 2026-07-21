"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { formatFrShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DossierRow, DossierStatut } from "../data";
import { slaState, type SlaKind } from "../sla";
import { StatusBadge } from "./status-badge";
import { SlaPill } from "./sla-pill";

type Filter = "tous" | "retard" | DossierStatut;
const filters: { key: Filter; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "retard", label: "En retard" },
  { key: "En attente", label: "En attente" },
  { key: "Devis envoyé", label: "Devis envoyé" },
];

type SortKey = "urgence" | "nom" | "cree";

/** Urgency order: late first, then today, then the rest; done and blocked sink. */
const URGENCY_RANK: Record<SlaKind, number> = {
  overdue: 0,
  "due-today": 1,
  "on-track": 2,
  blocked: 3,
  done: 4,
};

type DossiersTableProps = {
  /**
   * Passed in, never imported. This component is "use client", so a value
   * import of the data module would ship every dossier to the browser — which
   * is exactly what it used to do (see data.ts).
   */
  dossiers: DossierRow[];
  /** Server render time, so the first client render agrees with the server. */
  now: number;
};

/** Dossiers list — SLA-first ordering, search, filters, designed empty states. */
export function DossiersTable({ dossiers, now }: DossiersTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("tous");
  const [sort, setSort] = useState<SortKey>("urgence");
  const [clock, setClock] = useState(now);

  // Start from the server's clock, then keep it live. Doing this in an effect
  // (rather than Date.now() during render) is what keeps hydration honest.
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withSla = dossiers.map((d) => ({
      dossier: d,
      sla: slaState(clock, {
        paidAtMs: d.paidAt ? new Date(d.paidAt).getTime() : null,
        sent: d.statut === "Devis envoyé",
      }),
    }));

    const filtered = withSla.filter(({ dossier, sla }) => {
      const matchesFilter =
        filter === "tous" ||
        (filter === "retard" ? sla.kind === "overdue" : dossier.statut === filter);
      const matchesQuery =
        !q || dossier.nom.toLowerCase().includes(q) || dossier.ref.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });

    return filtered.sort((a, b) => {
      if (sort === "nom") return a.dossier.nom.localeCompare(b.dossier.nom, "fr");
      if (sort === "cree") return b.dossier.createdAt.localeCompare(a.dossier.createdAt);
      const rank = URGENCY_RANK[a.sla.kind] - URGENCY_RANK[b.sla.kind];
      if (rank !== 0) return rank;
      // Same bucket: soonest deadline first. Rows without one keep their order.
      return (a.sla.deadline ?? Infinity) - (b.sla.deadline ?? Infinity);
    });
  }, [dossiers, clock, query, filter, sort]);

  /** Header cells in DOM order — the grid places them, no col-start overrides. */
  const columns: { key: SortKey | null; label: string }[] = [
    { key: null, label: "Référence" },
    { key: "nom", label: "Demandeur" },
    { key: "cree", label: "Créé le" },
    { key: null, label: "Paiement" },
    { key: "urgence", label: "Échéance" },
    { key: null, label: "Statut" },
  ];

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-3">
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
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2.5 font-sans text-sm font-semibold transition-colors",
                filter === f.key
                  ? "border-navy bg-navy text-secondary-foreground"
                  : "border-input bg-paper text-ink-soft hover:border-aqua",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length > 0 && (
        <div className="border-border-faint bg-paper shadow-card mt-5 overflow-hidden rounded-xl border">
          {/* Desktop: a real table with sortable headers. Below md the same DOM
              reflows into cards — the old layout forced a 55rem min-width and
              left the entire list behind a horizontal scroll on a phone. */}
          <div className="text-hint border-border-faint bg-muted/50 hidden grid-cols-[7.5rem_1.4fr_7.5rem_6.5rem_10.5rem_9rem] items-center gap-3.5 border-b px-5 py-2.5 text-xs font-semibold tracking-wider uppercase md:grid">
            {columns.map((col) =>
              col.key === null ? (
                <span key={col.label}>{col.label}</span>
              ) : (
                <button
                  key={col.label}
                  type="button"
                  onClick={() => setSort(col.key!)}
                  aria-pressed={sort === col.key}
                  className={cn(
                    "hover:text-foreground -mx-2 cursor-pointer justify-self-start rounded border-none bg-transparent px-2 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase",
                    sort === col.key ? "text-link" : "text-hint",
                  )}
                >
                  {col.label}
                  {sort === col.key ? " ↓" : ""}
                </button>
              ),
            )}
          </div>

          <ul>
            {rows.map(({ dossier, sla }) => (
              <li key={dossier.ref} className="border-border-soft border-b last:border-b-0">
                <Link
                  href={`/admin/dossiers/${dossier.ref}`}
                  className="text-foreground hover:bg-muted focus-visible:bg-muted grid gap-x-3.5 gap-y-2 px-5 py-4 text-sm md:grid-cols-[7.5rem_1.4fr_7.5rem_6.5rem_10.5rem_9rem] md:items-center md:py-3.5"
                >
                  {/* The reference is its own column on desktop; on a phone it
                      rides under the name, where it reads as a subtitle. */}
                  <span className="text-ink-soft hidden font-mono text-xs md:block">
                    {dossier.ref}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{dossier.nom}</span>
                    <span className="text-hint truncate text-xs">
                      <span className="md:hidden">{dossier.ref} · </span>
                      {dossier.ville}
                    </span>
                  </span>
                  <span className="text-steel text-xs md:text-sm">
                    <span className="md:hidden">Créé le </span>
                    {formatFrShortDate(dossier.createdAt)}
                  </span>
                  {/* md:contents dissolves this wrapper at the breakpoint, so the
                      three badges are one flex row on a phone and three separate
                      grid cells on desktop — same DOM, no duplicated markup. */}
                  <div className="flex flex-wrap items-center gap-2 md:contents">
                    <span>
                      <StatusBadge paye={dossier.paidAt !== null} />
                    </span>
                    <span>
                      <SlaPill state={sla} />
                    </span>
                    <span>
                      <StatusBadge statut={dossier.statut} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length === 0 && !query.trim() && (
        <div className="border-input bg-paper mt-5 rounded-lg border border-dashed px-6 py-14 text-center">
          <DropletGlyph size="lg" inactive />
          <p className="text-steel mx-auto mt-3.5 max-w-md text-sm leading-relaxed">
            {filter === "tous"
              ? "Aucun dossier pour le moment — les dossiers apparaîtront ici dès la première commande payée."
              : "Aucun dossier dans cette catégorie."}
          </p>
        </div>
      )}

      {rows.length === 0 && query.trim() && (
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
        {rows.length} dossier{rows.length > 1 ? "s" : ""} · cliquez sur une ligne pour ouvrir le
        détail
      </div>
    </>
  );
}

import { cn } from "@/lib/utils";
import type { DossierStatut } from "../data";

const statutStyles: Record<DossierStatut, string> = {
  Nouveau: "bg-mist text-link",
  "En cours": "bg-border-soft text-ink-soft",
  "Devis envoyé": "bg-success-soft text-success-strong",
};

type StatusBadgeProps = {
  statut?: DossierStatut;
  paye?: boolean;
};

/** Pill badge — dossier status, or payment state when `paye` is given. */
export function StatusBadge({ statut, paye }: StatusBadgeProps) {
  if (typeof paye === "boolean") {
    return (
      <span
        className={cn(
          "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
          paye ? "bg-success-soft text-success-strong" : "bg-destructive/10 text-destructive",
        )}
      >
        {paye ? "Payé ✓" : "Échoué"}
      </span>
    );
  }
  if (!statut) return null;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
        statutStyles[statut],
      )}
    >
      {statut}
    </span>
  );
}

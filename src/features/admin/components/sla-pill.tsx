import { cn } from "@/lib/utils";
import type { SlaKind, SlaState } from "../sla";

/**
 * Only « en retard » is loud. If every state had a colour the row would carry
 * no signal — the point of the pill is that a late dossier catches the eye
 * from across the list.
 */
const styles: Partial<Record<SlaKind, string>> = {
  overdue: "bg-destructive/10 text-destructive px-2.5",
  "due-today": "bg-mist text-link px-2.5",
  "on-track": "text-steel",
};

export function SlaPill({ state }: { state: SlaState }) {
  // A dossier that is sent or unpaid has no deadline, and the payment/status
  // badges beside it already say « Devis envoyé » / « Échoué » — repeating that
  // here printed the same word twice on one row.
  if (state.kind === "done" || state.kind === "blocked") return null;

  return (
    <span
      className={cn("inline-block rounded-full py-1 text-xs font-semibold", styles[state.kind])}
    >
      {state.label}
    </span>
  );
}

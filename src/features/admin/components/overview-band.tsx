import { cn } from "@/lib/utils";
import type { DossierRow } from "../data";
import { slaState } from "../sla";

// Kept in cents: the tile multiplies by the number of paid dossiers, and
// 83,90 € as a float would drift (3 × 83.9 = 251.70000000000002).
const PRIX_TTC_CENTS = 8390;

const formatEuros = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

type OverviewBandProps = {
  dossiers: DossierRow[];
  now: number;
};

/**
 * The band answers the only question worth asking at 9am: what is late?
 *
 * « En retard » leads and is the only tile that ever turns red — a dashboard
 * where everything is coloured tells you nothing. The rest is context.
 */
export function OverviewBand({ dossiers, now }: OverviewBandProps) {
  const states = dossiers.map((d) =>
    slaState(now, {
      paidAtMs: d.paidAt ? new Date(d.paidAt).getTime() : null,
      sent: d.statut === "Devis envoyé",
    }),
  );

  const count = (kind: string) => states.filter((s) => s.kind === kind).length;
  const overdue = count("overdue");
  const encaisse = dossiers.filter((d) => d.paidAt !== null).length * PRIX_TTC_CENTS;

  // A restrained palette, not a rainbow: red still owns « alarm » (only when
  // something is actually late), green marks money, aqua marks the day's work,
  // and the counts stay navy. The dot carries the colour so the number can
  // hold its meaning (a red 0 would read as a problem where there is none).
  const alerting = overdue > 0;
  const tiles = [
    {
      key: "overdue",
      label: "En retard",
      value: String(overdue),
      hint: alerting ? "à traiter en priorité" : "rien en retard",
      dot: alerting ? "bg-destructive" : "bg-success",
      card: alerting ? "border-destructive/40 bg-destructive-soft" : "border-border-faint bg-paper",
      label_: alerting ? "text-destructive" : "text-steel",
      value_: alerting ? "text-destructive" : "text-foreground",
    },
    {
      key: "due",
      label: "À rendre aujourd’hui",
      value: String(count("due-today")),
      hint: "échéance des 48 h ouvrées",
      dot: "bg-aqua",
      card: "border-border-faint bg-paper",
      label_: "text-steel",
      value_: "text-foreground",
    },
    {
      key: "progress",
      label: "En attente de devis",
      value: String(count("on-track") + count("due-today") + overdue),
      hint: "payés, devis non envoyé",
      dot: "bg-hint",
      card: "border-border-faint bg-paper",
      label_: "text-steel",
      value_: "text-foreground",
    },
    {
      key: "revenue",
      label: "Encaissé",
      value: formatEuros(encaisse),
      hint: `${dossiers.filter((d) => d.paidAt !== null).length} dossiers payés`,
      dot: "bg-success",
      card: "border-border-faint bg-paper",
      label_: "text-steel",
      value_: "text-success-strong",
    },
  ];

  return (
    <dl className="mt-5.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.key} className={cn("shadow-card rounded-xl border px-5 py-4.5", tile.card)}>
          <dt
            className={cn(
              "flex items-center gap-2 text-xs font-semibold tracking-wider uppercase",
              tile.label_,
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", tile.dot)} />
            {tile.label}
          </dt>
          <dd className={cn("font-display mt-2.5 text-3xl font-bold", tile.value_)}>
            {tile.value}
          </dd>
          <dd
            className={cn(
              "mt-1 text-xs",
              tile.key === "overdue" && alerting ? "text-destructive/80" : "text-hint",
            )}
          >
            {tile.hint}
          </dd>
        </div>
      ))}
    </dl>
  );
}

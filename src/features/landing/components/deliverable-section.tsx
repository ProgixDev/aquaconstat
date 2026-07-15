import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const guarantees = [
  "Chiffrage poste par poste",
  "Document daté et signé",
  "Recevable par votre assurance",
] as const;

const sampleLines = [
  { label: "Réfection peinture plafond — salle de bain", amount: "412,00 €" },
  { label: "Traitement anti-humidité des supports", amount: "186,00 €" },
  { label: "Dépose et repose des plinthes — couloir", amount: "158,00 €" },
] as const;

/** « Ce que vous recevez » — navy band with a mock devis PDF card. */
export function DeliverableSection() {
  return (
    <section className="bg-navy-band rounded-panel flex flex-wrap items-center gap-11 overflow-hidden p-8 md:p-14">
      <div className="min-w-80 flex-1">
        <SectionBadge variant="navy">Ce que vous recevez</SectionBadge>
        <h2 className="font-display text-secondary-foreground mt-5 text-2xl leading-snug font-bold md:text-3xl">
          Un devis prêt pour votre assurance.
        </h2>
        <p className="text-mist/80 mt-3.5 max-w-lg text-base leading-relaxed">
          Un devis détaillé des travaux de remise en état, établi par un professionnel à partir de
          votre questionnaire et de vos photos, au format PDF, prêt à être transmis à votre
          assurance.
        </p>
        <ul className="text-background mt-5 flex flex-col gap-2.5 text-sm">
          {guarantees.map((g) => (
            <li key={g} className="flex items-center gap-2.5">
              <DropletGlyph />
              {g}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-w-72 flex-1 justify-center">
        <div className="bg-card shadow-pdf w-72 rounded-lg px-6 py-6">
          <div className="flex items-center gap-2">
            <DropletGlyph />
            <span className="font-display text-foreground text-xs font-bold tracking-widest">
              AQUACONSTAT
            </span>
            <span className="text-muted-foreground ml-auto text-xs">PDF</span>
          </div>
          <div className="mt-4 text-sm font-semibold">
            Devis — remise en état après dégât des eaux
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Réf. AC-2026-0147 · établi le 17 juin 2026
          </div>
          <div className="border-border-soft text-ink-soft mt-4 flex flex-col gap-2 border-t pt-3 text-xs">
            {sampleLines.map((line) => (
              <div key={line.label} className="flex justify-between gap-3">
                <span>{line.label}</span>
                <span className="font-semibold whitespace-nowrap">{line.amount}</span>
              </div>
            ))}
            <div className="text-muted-foreground/70 flex justify-between gap-3">
              <span>…</span>
              <span>…</span>
            </div>
          </div>
          <div className="border-border-soft mt-3 flex justify-between border-t pt-2.5 text-xs font-semibold">
            <span>Total travaux TTC</span>
            <span>—</span>
          </div>
        </div>
      </div>
    </section>
  );
}

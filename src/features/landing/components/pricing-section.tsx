import { CtaButton } from "./cta-button";
import { DropletGlyph } from "./droplet-glyph";
import { SectionBadge } from "./section-badge";

const included = [
  "Étude complète de votre dossier",
  "Devis détaillé sous 48 h ouvrées",
  "Échange par e-mail si une précision est nécessaire",
] as const;

/** « Tarif » — one confident price card, no plan grid. */
export function PricingSection() {
  return (
    <section
      id="tarif"
      className="bg-card rounded-panel shadow-panel scroll-mt-6 p-8 text-center md:p-14"
    >
      <SectionBadge>Tarif</SectionBadge>
      <div className="font-display text-foreground mt-4.5 text-5xl font-bold md:text-7xl">
        149 € <span className="text-xl">— tout compris</span>
      </div>
      <ul className="text-ink-soft mx-auto mt-6 flex max-w-md flex-col gap-3 text-left text-base">
        {included.map((item) => (
          <li key={item} className="bg-muted flex items-center gap-3 rounded-md px-4.5 py-3">
            <DropletGlyph />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <CtaButton href="/dossier" size="lg">
          Démarrer mon dossier
        </CtaButton>
      </div>
      <div className="text-muted-foreground mt-3 text-xs">Paiement unique, aucun abonnement.</div>
    </section>
  );
}

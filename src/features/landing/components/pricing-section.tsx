import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const included = [
  "Étude complète de votre dossier",
  "Devis détaillé sous 48 h ouvrées",
  "Échange par e-mail si une précision est nécessaire",
] as const;

/** « Tarif » — one confident split panel: navy price face, plain includes. */
export function PricingSection() {
  return (
    <section id="tarif" className="bg-card scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div className="border-border-soft bg-paper rounded-panel grid overflow-hidden border md:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-navy-cta flex flex-col items-center justify-center px-8 py-14 text-center md:py-20">
            <SectionBadge variant="navy">Tarif</SectionBadge>
            <div className="font-display text-secondary-foreground mt-6 text-6xl font-bold md:text-7xl">
              149 €
            </div>
            <div className="font-display text-aqua-pale mt-2 text-xl italic">— tout compris</div>
            <div className="text-aqua-pale/85 mt-6 text-xs">Paiement unique, aucun abonnement.</div>
          </div>
          <div className="flex flex-col justify-center px-8 py-12 md:px-14">
            <ul className="divide-border-soft divide-y">
              {included.map((item) => (
                <li key={item} className="text-ink-soft flex items-center gap-3.5 py-4 text-base">
                  <DropletGlyph />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CtaButton href="/dossier" size="lg">
                Démarrer mon dossier
              </CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

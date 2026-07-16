import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { PriceFill } from "./price-fill";
import { SectionBadge } from "./section-badge";

const included = [
  "Étude complète de votre dossier",
  "Devis détaillé sous 48 h ouvrées",
  "Échange par e-mail si une précision est nécessaire",
] as const;

/**
 * « Tarif » — one compact bar that reads left to right: the price, what it
 * buys, the way in. Kept light on purpose (the band above it is navy), and
 * kept short: the figure floods with water, which is all the drama a single
 * price needs — it doesn't need a section to itself.
 */
export function PricingSection() {
  return (
    <section id="tarif" className="bg-card relative scroll-mt-20 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="from-aqua-pale/30 absolute top-1/2 left-1/4 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-70%" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-14">
        <div className="grid items-center gap-x-12 gap-y-8 md:grid-cols-[auto_1fr_auto]">
          {/* The price, with its ripples — the only drama in the bar. */}
          <div className="relative text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <SectionBadge>Tarif</SectionBadge>
            </div>
            <div className="relative mt-3 inline-block">
              <span
                aria-hidden
                className="border-aqua/25 animate-droplet-ripple absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              />
              <span
                aria-hidden
                className="border-aqua/20 animate-droplet-ripple-alt absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              />
              <div className="font-display relative text-6xl leading-none font-bold md:text-7xl">
                <PriceFill value="149 €" />
              </div>
            </div>
            <div className="font-display text-ink-soft mt-2 text-lg italic">— tout compris</div>
          </div>

          <ul className="text-ink-soft border-border flex flex-col gap-2.5 border-t pt-6 text-sm md:border-t-0 md:border-l md:pt-0 md:pl-12">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <DropletGlyph />
                {item}
              </li>
            ))}
          </ul>

          <div className="border-border border-t pt-6 text-center md:border-t-0 md:border-l md:pt-0 md:pl-12 md:text-left">
            <CtaButton href="/dossier" size="lg">
              Payer et recevoir mon devis sous 48 h
            </CtaButton>
            <p className="text-muted-foreground mt-3 text-xs">Paiement unique, aucun abonnement.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

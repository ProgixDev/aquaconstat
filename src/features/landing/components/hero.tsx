import Image from "next/image";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { HeroDroplet } from "./hero-droplet";
import { SectionBadge } from "./section-badge";

const stats = [
  { value: "48 h", suffix: "ouvrées", label: "pour recevoir votre devis" },
  { value: "100 %", label: "à distance, sans déplacement" },
  { value: "Stripe", label: "paiement sécurisé" },
] as const;

/** Navy cinematic hero — editorial split, caustics depth, docked CTA seam bar. */
export function Hero() {
  return (
    <div className="relative">
      <section className="bg-navy-hero relative overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1600&q=70"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="from-navy/80 via-navy/30 to-navy/85 absolute inset-0 bg-linear-180" />
        </div>
        <div
          aria-hidden
          className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-x-6 bottom-24 text-8xl font-bold whitespace-nowrap italic md:text-9xl"
        >
          AquaConstat
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-28 md:px-10 md:pt-36 md:pb-32">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <SectionBadge variant="navy">Dégât des eaux · Devis à distance</SectionBadge>
              <h1 className="font-display text-secondary-foreground mt-7 text-4xl leading-[1.08] font-bold md:text-6xl">
                Votre devis dégât des eaux, <em className="text-aqua-bright">sans attendre</em> le
                passage d’un artisan
              </h1>
              <p className="text-mist/85 mt-7 max-w-lg text-base leading-relaxed md:text-lg">
                Décrivez votre sinistre, ajoutez vos photos, et recevez sous 48 h ouvrées un devis
                détaillé à transmettre à votre assurance. 100 % en ligne, depuis votre téléphone.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <CtaButton href="/dossier">Démarrer mon dossier</CtaButton>
                <a
                  href="#comment-ca-marche"
                  className="border-aqua-pale/30 text-background hover:border-aqua-pale/60 inline-block rounded-full border px-6 py-3.5 text-sm font-semibold"
                >
                  Comment ça marche
                </a>
              </div>
              <div className="text-aqua-pale/85 mt-4 text-xs">
                149 € · paiement sécurisé Stripe · sans création de compte
              </div>
            </div>

            <div className="relative mx-auto h-72 w-64 md:h-88 md:w-80" aria-hidden>
              <div className="from-aqua-bright/25 absolute top-1/2 left-1/2 h-[120%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-65%" />
              <HeroDroplet />
              <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift absolute top-[8%] -right-4 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap md:-right-10">
                <DropletGlyph />
                Devis sous 48 h ouvrées
              </div>
              <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift-alt absolute bottom-[10%] -left-6 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap md:-left-12">
                <DropletGlyph />
                100 % en ligne
              </div>
            </div>
          </div>

          <div className="border-aqua-pale/15 mt-16 flex flex-wrap gap-y-6 border-t pt-8">
            {stats.map((stat, i) => (
              <div key={stat.value} className="flex">
                {i > 0 && <span aria-hidden className="bg-aqua-pale/15 mx-8 w-px md:mx-14" />}
                <div>
                  <div className="font-display text-secondary-foreground text-2xl font-bold md:text-3xl">
                    {stat.value}{" "}
                    {"suffix" in stat && <span className="text-base">{stat.suffix}</span>}
                  </div>
                  <div className="text-aqua-pale/85 mt-1 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bar docked at the hero/content seam (design brief §2, Image 2 anchor). */}
      <div className="relative z-10 -mt-9 px-6">
        <div className="bg-paper border-border-soft shadow-panel mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-full border px-7 py-4">
          <span className="text-sm">
            <strong className="font-semibold">Devis détaillé sous 48 h ouvrées</strong>
            <span className="text-muted-foreground"> — 149 € tout compris</span>
          </span>
          <CtaButton href="/dossier" size="sm">
            Démarrer mon dossier
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

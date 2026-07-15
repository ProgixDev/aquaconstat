import Image from "next/image";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { HeroDroplet } from "./hero-droplet";
import { HeroIntro } from "./hero-intro";
import { ImpactJolt } from "./impact-jolt";
import { ScrollCue } from "./scroll-cue";
import { StatCounter } from "./stat-counter";

const stats = [
  { value: "48 h", suffix: "ouvrées", label: "pour recevoir votre devis" },
  { value: "100 %", label: "à distance, sans déplacement" },
  { value: "Stripe", label: "paiement sécurisé" },
] as const;

/** Navy cinematic hero — editorial split, living caustics depth, docked CTA seam bar. */
export function Hero() {
  return (
    <div className="relative">
      {/* Scroll runway — on desktop the hero pins while scrolling drives the
          droplet's descent → splash, then the drop swims home on its own. */}
      <div id="hero-runway" className="bg-navy lg:h-[145vh]">
        <section className="bg-navy-hero relative overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center">
          <div aria-hidden className="absolute inset-0">
            <div className="animate-caustics-drift absolute inset-0 will-change-transform">
              <Image
                src="https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1600&q=70"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-25"
              />
            </div>
            <div className="from-navy/80 via-navy/30 to-navy/85 absolute inset-0 bg-linear-180" />
            <div className="bg-grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
          </div>
          <div
            aria-hidden
            className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-x-6 bottom-24 text-8xl font-bold whitespace-nowrap italic md:text-9xl"
          >
            AquaConstat
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-6 pt-32 pb-28 md:px-10 md:pt-36 md:pb-32 lg:pt-28 lg:pb-10">
            <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
              <HeroIntro />

              <div className="relative mx-auto h-80 w-72 md:h-112 md:w-100" aria-hidden>
                <div className="from-aqua-bright/25 absolute top-1/2 left-1/2 h-[120%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-65%" />
                <HeroDroplet />
                <ImpactJolt className="absolute top-[8%] -right-4 md:-right-10" delay={60}>
                  <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap">
                    <DropletGlyph />
                    Devis sous 48 h ouvrées
                  </div>
                </ImpactJolt>
                <ImpactJolt className="absolute bottom-[10%] -left-6 md:-left-12" delay={140}>
                  <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift-alt flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap">
                    <DropletGlyph />
                    100 % en ligne
                  </div>
                </ImpactJolt>
              </div>
            </div>

            <div className="border-aqua-pale/15 mt-16 flex flex-wrap gap-y-6 border-t pt-8">
              {stats.map((stat, i) => (
                <div key={stat.value} className="flex">
                  {i > 0 && <span aria-hidden className="bg-aqua-pale/15 mx-8 w-px md:mx-14" />}
                  <div>
                    <div className="font-display text-secondary-foreground text-2xl font-bold md:text-3xl">
                      <StatCounter value={stat.value} />{" "}
                      {"suffix" in stat && <span className="text-base">{stat.suffix}</span>}
                    </div>
                    <div className="text-aqua-pale/85 mt-1 text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ScrollCue />
        </section>
      </div>

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

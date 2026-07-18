import Image from "next/image";
import { cn } from "@/lib/utils";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { HeroDroplet } from "./hero-droplet";
import { HeroEcoPledge } from "./hero-eco-pledge";
import { HeroIntro } from "./hero-intro";
import { HeroKicker } from "./hero-kicker";
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
      <div id="hero-runway" className="bg-navy lg:h-[145svh]">
        {/* The pinned hero centres its content in the space *below* the fixed
            header (pt ≈ header height), so short laptops can never slide the
            eyebrow underneath it — a structural guarantee, not a magic number
            per breakpoint. */}
        <section className="bg-navy-hero relative overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:pt-24">
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

          {/* Once pinned, the hero's vertical rhythm is a function of viewport
              height, not a fixed block: every gap scales with svh, so the
              content fits a 720p laptop and still breathes on a 1080p display.
              The pb floor reserves room for the scroll cue. */}
          <div className="relative mx-auto w-full max-w-6xl px-6 pt-26 pb-16 md:px-10 md:pt-32 md:pb-32 lg:pt-[clamp(0.5rem,2svh,1.5rem)] lg:pb-[clamp(3.5rem,7svh,4.5rem)]">
            <HeroKicker />
            <div className="mt-4 grid items-center gap-6 sm:mt-10 sm:gap-12 md:mt-12 lg:mt-[clamp(1.5rem,4svh,3rem)] lg:grid-cols-[1.15fr_0.85fr]">
              <HeroIntro />

              <div
                /* The droplet is the hero's flagship visual, so it takes the
                   height it can get: full 28rem on a tall display, shrinking
                   only as far as a 720p laptop actually requires. The phone
                   size is tuned so the droplet reads big yet the green pledge
                   below it still lands in the fold. */
                className="relative mx-auto h-56 w-48 md:h-104 md:w-92 lg:aspect-[25/28] lg:h-[clamp(13.5rem,37svh,25rem)] lg:w-auto"
                aria-hidden
              >
                <div className="from-aqua-bright/25 absolute top-1/2 left-1/2 h-[120%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-65%" />
                <HeroDroplet />
              </div>
            </div>

            {/* « Engagement vert » — the client's major selling point, moved
                front-and-centre right under the hero split (client feedback,
                2026-07-18): it must jump out on the first screen. The
                48 h / 100 % / Stripe proof row is demoted just below it. */}
            <div className="border-aqua-pale/15 mt-5 border-t pt-4 sm:mt-10 sm:pt-7 lg:mt-[clamp(1.25rem,3.5svh,2.75rem)] lg:pt-[clamp(0.75rem,2.5svh,1.5rem)]">
              <HeroEcoPledge />

              {/* 48 h / 100 % / Stripe — moved below the green line, now the
                  secondary proof of the hero.
                  Mobile: each proof is one horizontal row — big value on the
                  left, label filling the right. From sm up it becomes the
                  centred three-across bar with vertical dividers. */}
              <dl className="divide-aqua-pale/12 mx-auto mt-9 flex flex-col divide-y sm:mt-6 sm:w-fit sm:flex-row sm:divide-y-0 lg:mt-[clamp(0.5rem,2svh,1.25rem)]">
                {stats.map((stat, i) => (
                  <div
                    key={stat.value}
                    className={cn(
                      "flex items-center justify-between gap-5 py-3.5 first:pt-0 last:pb-0",
                      "sm:flex-col sm:items-stretch sm:justify-start sm:gap-0 sm:px-7 sm:py-0 sm:text-center",
                      i > 0 && "sm:border-aqua-pale/15 sm:border-l",
                    )}
                  >
                    <dd className="font-display text-secondary-foreground text-2xl font-bold md:text-3xl">
                      <StatCounter value={stat.value} />{" "}
                      {"suffix" in stat && (
                        <span className="text-base font-semibold">{stat.suffix}</span>
                      )}
                    </dd>
                    <dt className="text-aqua-pale/80 max-w-[9.5rem] text-right text-xs leading-snug text-balance sm:mt-1.5 sm:max-w-none sm:text-center">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <ScrollCue />
        </section>
      </div>

      {/* CTA bar docked at the hero/content seam (design brief §2, Image 2
          anchor). Dark glass with an aqua core glow: a pale pill read as a
          system alert and died against the light section it sits on. Deeper
          than the hero navy + a lit ring, so it stays one object across the
          seam. This is also where the price re-enters after the hero. */}
      <div className="relative z-10 -mt-10 px-6">
        <div className="border-aqua-pale/25 bg-navy-deep/90 shadow-cta relative mx-auto max-w-3xl overflow-hidden rounded-3xl border backdrop-blur-xl sm:rounded-full">
          <div
            aria-hidden
            className="from-aqua/30 via-navy-light/10 absolute inset-0 bg-radial to-transparent to-72%"
          />
          {/* Lit top edge — the highlight that makes the pill read as glass. */}
          <div
            aria-hidden
            className="via-aqua-pale/45 absolute inset-x-12 top-0 h-px bg-linear-90 from-transparent to-transparent"
          />
          <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-3 px-6 py-3.5">
            <span className="flex items-center gap-2.5">
              <DropletGlyph />
              <span className="text-mist text-sm">Devis détaillé sous 48 h ouvrées</span>
            </span>
            <span aria-hidden className="bg-aqua-pale/25 hidden h-6 w-px sm:block" />
            <span className="font-display text-secondary-foreground text-lg font-bold">
              82,90 € <span className="text-aqua-pale/80 text-xs font-semibold">tout compris</span>
            </span>
            <CtaButton href="/dossier" size="sm">
              Démarrer mon dossier
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}

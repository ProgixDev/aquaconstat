import Image from "next/image";
import { CtaButton } from "./cta-button";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const stats = [
  { value: "48 h", suffix: "ouvrées", label: "pour recevoir votre devis" },
  { value: "100 %", label: "à distance, sans déplacement" },
  { value: "Stripe", label: "paiement sécurisé" },
] as const;

/** Navy cinematic hero — headline, CTAs, animated droplet, trust stats. */
export function Hero() {
  return (
    <section className="bg-navy-hero rounded-panel relative overflow-hidden px-5 pt-11 pb-9 text-center md:px-14 md:pt-18">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1600&q=70"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="from-navy/70 via-navy/30 to-navy/80 absolute inset-0 bg-linear-180" />
      </div>
      <div
        aria-hidden
        className="font-display text-secondary-foreground/5 pointer-events-none absolute inset-x-0 bottom-20 text-8xl font-bold whitespace-nowrap italic md:text-9xl"
      >
        AquaConstat
      </div>

      <SectionBadge variant="navy">Dégât des eaux · Devis à distance</SectionBadge>

      <h1 className="font-display text-secondary-foreground relative mx-auto mt-6 max-w-3xl text-3xl leading-snug font-bold md:text-5xl">
        Votre devis dégât des eaux, sans attendre le passage d’un artisan
      </h1>
      <p className="text-mist/80 relative mx-auto mt-5 max-w-xl text-base leading-relaxed">
        Décrivez votre sinistre, ajoutez vos photos, et recevez sous 48 h ouvrées un devis détaillé
        à transmettre à votre assurance. 100 % en ligne, depuis votre téléphone.
      </p>

      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3.5">
        <CtaButton href="/dossier">Démarrer mon dossier</CtaButton>
        <a
          href="#comment-ca-marche"
          className="border-aqua-pale/30 text-background inline-block rounded-full border px-6 py-3.5 text-sm font-semibold"
        >
          Comment ça marche
        </a>
      </div>
      <div className="text-aqua-pale/85 relative mt-2.5 text-xs">
        149 € · paiement sécurisé Stripe · sans création de compte
      </div>

      <div className="relative mt-4 flex justify-center">
        <div className="relative h-64 w-56 md:h-80 md:w-72">
          <div
            aria-hidden
            className="from-aqua-bright/20 absolute top-[52%] left-1/2 h-[115%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent to-60%"
          />
          <div aria-hidden className="animate-droplet-float absolute inset-0">
            <div className="rounded-droplet-lg border-aqua-pale/40 shadow-droplet from-mist/30 via-aqua-bright/35 to-navy-light/60 absolute top-1/2 left-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-linear-135 via-45%" />
            <div className="from-paper/90 absolute top-[31%] left-[35%] h-[17%] w-[12%] -rotate-12 rounded-full bg-radial to-transparent" />
          </div>
          <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift absolute top-[12%] -right-[58%] flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap">
            <DropletGlyph />
            Devis sous 48 h ouvrées
          </div>
          <div className="bg-paper/95 text-foreground shadow-chip animate-droplet-drift-alt absolute bottom-[16%] -left-[62%] flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap">
            <DropletGlyph />
            100 % en ligne
          </div>
        </div>
      </div>

      <div className="border-aqua-pale/15 relative mt-6 flex flex-wrap justify-center border-t pt-6">
        {stats.map((stat, i) => (
          <div key={stat.value} className="flex">
            {i > 0 && <span aria-hidden className="bg-aqua-pale/15 w-px" />}
            <div className="px-6 py-1 text-center md:px-12">
              <div className="font-display text-secondary-foreground text-2xl font-bold md:text-3xl">
                {stat.value} {"suffix" in stat && <span className="text-base">{stat.suffix}</span>}
              </div>
              <div className="text-aqua-pale/85 mt-1 text-xs">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

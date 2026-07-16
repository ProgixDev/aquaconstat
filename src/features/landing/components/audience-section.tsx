import Image from "next/image";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { Reveal } from "@/components/ui/reveal";
import { SectionBadge } from "./section-badge";
import { SectionNote } from "./section-note";

const audiences = [
  {
    title: "Propriétaire occupant",
    text: "Vous devez chiffrer la remise en état de votre logement pour votre assurance.",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  },
  {
    title: "Locataire",
    text: "Votre assurance vous demande un devis pour débloquer votre dossier.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  },
  {
    title: "Bailleur / agence",
    text: "Vous gérez le sinistre d’un bien loué, sans vous déplacer.",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
  },
  {
    title: "Gestionnaire ou syndic",
    text: "Vous centralisez les devis nécessaires au dossier de la copropriété.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
  },
] as const;

/**
 * « À qui s’adresse ce service » — four cinematic posters. Each profile gets a
 * real interior, sunk under a navy gradient so the type stays legible and the
 * whole row reads as one dark strip cut into the light section.
 */
export function AudienceSection() {
  return (
    <section className="bg-paper">
      {/* Tighter than the neighbouring sections on purpose: the posters carry
          this one, so it needs far less framing air than a text section. */}
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <SectionBadge>À qui s’adresse ce service</SectionBadge>
            <h2 className="font-display mt-4 max-w-md text-3xl leading-snug font-bold md:text-4xl">
              Quel que soit votre lien avec le logement touché.
            </h2>
          </div>
          <SectionNote>
            Un dégât des eaux ne prévient pas. La démarche, elle, est la même pour tout le monde.
          </SectionNote>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <article className="rounded-panel group relative aspect-square overflow-hidden sm:aspect-4/5 lg:aspect-[5/6]">
                <Image
                  src={`${a.image}?auto=format&fit=crop&w=800&q=70`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover saturate-90 transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                {/* Navy wash — solid under the type, clearing by mid-frame so the
                    room still reads. A flat tint grades the four photos together. */}
                <div aria-hidden className="bg-navy/20 absolute inset-0" />
                <div
                  aria-hidden
                  className="from-navy-deep via-navy-deep/55 absolute inset-0 bg-linear-0 from-10% via-52% to-transparent"
                />
                <div
                  aria-hidden
                  className="ring-aqua-bright/0 group-hover:ring-aqua-bright/40 absolute inset-0 rounded-[inherit] ring-1 transition duration-500 ring-inset"
                />
                <div className="relative flex h-full flex-col justify-end p-5">
                  <DropletGlyph size="md" />
                  <h3 className="font-display text-secondary-foreground mt-3 text-xl leading-snug font-bold">
                    {a.title}
                  </h3>
                  {/* Reserves the tallest blurb’s height so all four titles
                      land on one line across the row. */}
                  <p className="text-mist/80 mt-2 text-sm leading-relaxed sm:min-h-17">{a.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

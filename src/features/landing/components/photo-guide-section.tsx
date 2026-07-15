import Image from "next/image";
import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const pointers = [
  "Une vue générale de chaque pièce touchée",
  "Les zones endommagées de près",
  "Les murs, le plafond, le sol",
] as const;

/** « Vos photos suffisent » — editorial split with a real photo mosaic. */
export function PhotoGuideSection() {
  return (
    <section className="bg-paper relative overflow-hidden">
      <div
        aria-hidden
        className="from-aqua-pale/25 absolute -top-32 -right-40 size-150 rounded-full bg-radial to-transparent to-70%"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-x-16 gap-y-12 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionBadge>Vos photos suffisent</SectionBadge>
          <h2 className="font-display mt-5 text-3xl leading-snug font-bold md:text-4xl">
            Pas besoin d’un expert sur place.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed md:text-lg">
            Quatre à huit photos depuis votre téléphone, en suivant nos consignes de prise de vue —
            le professionnel fait le reste.
          </p>
          <ul className="text-ink-soft mt-7 flex flex-col gap-3 text-sm md:text-base">
            {pointers.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <DropletGlyph />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-[1.15fr_0.85fr] grid-rows-[11rem_11rem] gap-4 md:grid-rows-[12rem_12rem]">
          <figure className="row-span-2 m-0 flex flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=70"
                alt="Vue générale d’une salle de bain"
                fill
                sizes="(min-width: 768px) 28rem, 90vw"
                className="object-cover"
              />
            </div>
            <figcaption className="text-muted-foreground text-xs">
              <strong className="text-foreground font-semibold">Vue générale</strong> · chaque pièce
              touchée
            </figcaption>
          </figure>
          <figure className="m-0 flex flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70"
                alt="Plafond et volumes d’un séjour lumineux"
                fill
                sizes="(min-width: 768px) 20rem, 45vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="text-muted-foreground text-xs">
              <strong className="text-foreground font-semibold">Le plafond</strong>
            </figcaption>
          </figure>
          <figure className="m-0 flex flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=70"
                alt="Mur et parquet d’un salon"
                fill
                sizes="(min-width: 768px) 20rem, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="text-muted-foreground text-xs">
              <strong className="text-foreground font-semibold">La zone de près</strong>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const pointers = [
  "Une vue générale de chaque pièce touchée",
  "Les zones endommagées de près",
  "Les murs, le plafond, le sol",
] as const;

/** « Vos photos suffisent » — guidance plus a placeholder shot grid. */
export function PhotoGuideSection() {
  return (
    <section className="bg-card rounded-panel shadow-panel flex flex-wrap items-center gap-10 p-7 md:p-12">
      <div className="max-w-md min-w-72 flex-1">
        <SectionBadge>Vos photos suffisent</SectionBadge>
        <h2 className="font-display mt-4.5 text-2xl leading-snug font-bold md:text-3xl">
          Pas besoin d’un expert sur place.
        </h2>
        <p className="text-muted-foreground mt-3.5 text-base leading-relaxed">
          Quatre à huit photos depuis votre téléphone, en suivant nos consignes de prise de vue — le
          professionnel fait le reste.
        </p>
        <ul className="text-ink-soft mt-4.5 flex flex-col gap-2 text-sm">
          {pointers.map((p) => (
            <li key={p} className="flex items-center gap-2.5">
              <DropletGlyph />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid min-w-72 flex-1 grid-cols-[1.15fr_0.85fr] grid-rows-[10.5rem_10.5rem] gap-3.5">
        <figure className="row-span-2 m-0 flex flex-col gap-2">
          <div className="from-mist to-aqua-pale/40 text-ink-soft/70 flex flex-1 items-center justify-center rounded-xl bg-linear-135 p-3 text-center text-xs">
            Photo — vue générale de la pièce
          </div>
          <figcaption className="text-muted-foreground text-xs">
            <strong className="text-foreground font-semibold">Vue générale</strong> · chaque pièce
            touchée
          </figcaption>
        </figure>
        <figure className="m-0 flex flex-col gap-2">
          <div className="from-mist to-aqua-pale/40 text-ink-soft/70 flex flex-1 items-center justify-center rounded-xl bg-linear-135 p-3 text-center text-xs">
            Photo — le plafond
          </div>
          <figcaption className="text-muted-foreground text-xs">
            <strong className="text-foreground font-semibold">Le plafond</strong>
          </figcaption>
        </figure>
        <figure className="m-0 flex flex-col gap-2">
          <div className="from-mist to-aqua-pale/40 text-ink-soft/70 flex flex-1 items-center justify-center rounded-xl bg-linear-135 p-3 text-center text-xs">
            Photo — la zone de près
          </div>
          <figcaption className="text-muted-foreground text-xs">
            <strong className="text-foreground font-semibold">La zone de près</strong>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

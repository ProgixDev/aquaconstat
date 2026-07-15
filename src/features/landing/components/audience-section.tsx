import { DropletGlyph } from "@/components/ui/droplet-glyph";
import { SectionBadge } from "./section-badge";

const audiences = [
  {
    title: "Propriétaire occupant",
    text: "Vous devez chiffrer la remise en état de votre logement pour votre assurance.",
  },
  {
    title: "Locataire",
    text: "Votre assurance vous demande un devis pour débloquer votre dossier.",
  },
  {
    title: "Bailleur / agence",
    text: "Vous gérez le sinistre d’un bien loué, sans vous déplacer.",
  },
  {
    title: "Gestionnaire ou syndic",
    text: "Vous centralisez les devis nécessaires au dossier de la copropriété.",
  },
] as const;

/** « À qui s’adresse ce service » — editorial split, hairline list instead of card grid. */
export function AudienceSection() {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-x-16 gap-y-10 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionBadge>À qui s’adresse ce service</SectionBadge>
          <h2 className="font-display mt-5 max-w-sm text-3xl leading-snug font-bold md:text-4xl">
            Quel que soit votre lien avec le logement touché.
          </h2>
        </div>
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.title} className="border-border border-t pt-5">
              <div className="flex items-center gap-2.5 text-lg font-semibold">
                <DropletGlyph size="md" />
                {a.title}
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

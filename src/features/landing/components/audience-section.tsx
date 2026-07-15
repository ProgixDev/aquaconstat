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

/** « À qui s’adresse ce service » — four profile cards. */
export function AudienceSection() {
  return (
    <section className="bg-card rounded-panel shadow-panel p-7 md:p-12">
      <div className="flex flex-wrap items-baseline gap-x-7 gap-y-4">
        <SectionBadge>À qui s’adresse ce service</SectionBadge>
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Quel que soit votre lien avec le logement touché.
        </h2>
      </div>
      <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <div key={a.title} className="bg-muted rounded-xl p-6">
            <DropletGlyph size="md" />
            <div className="mt-3 text-base font-semibold">{a.title}</div>
            <div className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{a.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

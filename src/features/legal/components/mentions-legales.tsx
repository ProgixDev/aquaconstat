import { FactList, LegalSection, LegalShell } from "./legal-shell";

/**
 * Mentions légales — client content delivered 2026-07-16 (spec 005). The
 * domain is not purchased yet, so the text designates the site by name
 * rather than URL; the hébergeur (Vercel) and the contact address
 * (contact@olala.fr, as in the footer) were confirmed by the owner.
 */
export function MentionsLegales() {
  return (
    <LegalShell title="Mentions légales" version="Version du 16 juillet 2026">
      <LegalSection title="1. Éditeur du site">
        <p>
          Le site Ôlala (ci-après « le Site ») est édité, développé et exploité par la société :
        </p>
        <FactList
          rows={[
            { label: "Dénomination sociale", value: "BEERI CAPITAL" },
            { label: "Forme juridique", value: "Société par actions simplifiée (SAS)" },
            { label: "Capital social", value: "1 000,00 €" },
            {
              label: "Siège social",
              value: "C/o les Tricolores, 110 rue de Fontenay, 94300 Vincennes",
            },
            { label: "Immatriculation", value: "999 817 174 R.C.S. Créteil" },
            { label: "EUID", value: "FR9401.999817174" },
            { label: "Contact", value: "contact@olala.fr" },
            { label: "Directrice de la publication", value: "Estelle Boudon" },
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Hébergeur du site">
        <p>Le Site est hébergé par la société :</p>
        <FactList
          rows={[
            { label: "Dénomination sociale", value: "Vercel Inc." },
            {
              label: "Siège social",
              value: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
            },
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Propriété intellectuelle et marques">
        <p>
          La marque Ôlala® ainsi que l’ensemble des logos, graphismes, designs, codes sources,
          icônes, textes et slogans associés présents sur le Site sont des marques déposées et des
          créations protégées par le droit d’auteur, propriétés exclusives de la société BEERI
          CAPITAL.
        </p>
        <p>
          Toute utilisation, reproduction, diffusion, commercialisation ou modification de la marque
          Ôlala® ou de tout élément du Site, en tout ou partie, sans l’accord écrit préalable et
          exprès de la société BEERI CAPITAL est strictement interdite et constitue un délit de
          contrefaçon sanctionné par le Code de la propriété intellectuelle.
        </p>
      </LegalSection>

      <LegalSection title="4. Partenaire de réalisation des devis">
        <p>
          Les prestations techniques de chiffrage, d’évaluation des dommages et d’établissement des
          devis officiels de travaux de rénovation sont réalisées de manière exclusive pour le
          compte de l’éditeur par la société :
        </p>
        <FactList
          rows={[
            { label: "Dénomination sociale", value: "SAS BATITEC" },
            { label: "SIRET", value: "910 044 163 00012 (code APE 4333Z)" },
            { label: "Siège social", value: "35 rue des Cailloux, 92400 Clichy" },
          ]}
        />
      </LegalSection>
    </LegalShell>
  );
}

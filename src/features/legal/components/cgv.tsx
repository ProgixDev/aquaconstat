import Link from "next/link";
import { LegalList, LegalSection, LegalShell } from "./legal-shell";

/**
 * CGV — client content, 2026-07-16 (spec 005). Two deviations from the
 * delivered draft, recorded in the spec: the price is 82,90 € TTC (the
 * contractual figure, confirmed by the owner — the site was re-swept to
 * match), and article 5 quotes the TWO consent checkboxes the payment page
 * actually shows (spec 003) instead of the draft's single combined sentence.
 */
export function Cgv() {
  return (
    <LegalShell title="Conditions Générales de Vente" version="Version du 16 juillet 2026">
      <LegalSection title="Préambule">
        <p>
          Le site Ôlala (ci-après « le Site ») propose un service en ligne de génération et
          d’édition de devis officiels de travaux de rénovation et d’embellissement consécutifs à un
          sinistre (notamment dégât des eaux).
        </p>
        <p>
          Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent de façon
          exclusive et exhaustive les relations contractuelles entre :
        </p>
        <LegalList
          items={[
            <>
              <strong>Le Client :</strong> tout utilisateur (particulier ou professionnel de
              l’immobilier tel qu’un syndic de copropriété, agence ou gérant d’immeuble) effectuant
              une commande de chiffrage sur le Site.
            </>,
            <>
              Les prestations techniques de chiffrage, d’évaluation des dommages et d’établissement
              des devis officiels de travaux de rénovation sont réalisées en partenariat exclusif
              pour le compte de la SAS BEERI CAPITAL par un réseau d’entreprises du bâtiment
              qualifiées, toutes immatriculées sous le code APE 4333Z (Travaux de revêtement des
              sols et des murs) ou équivalent.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Article 1 — Objet et acceptation des CGV">
        <p>
          Les présentes CGV visent à encadrer les conditions dans lesquelles le Client commande et
          le Prestataire réalise un devis estimatif complet de rénovation sur la base exclusive des
          informations déclaratives et des photographies transmises par le Client en ligne. Toute
          commande sur le Site implique l’adhésion préalable, totale et inconditionnelle du Client
          aux présentes CGV en cochant la case prévue à cet effet avant le paiement.
        </p>
      </LegalSection>

      <LegalSection title="Article 2 — Description du service et parcours de commande">
        <p>
          Le service fourni consiste en la rédaction par un professionnel qualifié et la livraison
          sous 48 heures ouvrées d’un devis de travaux de rénovation (peinture, lessivage, sols,
          etc.), conforme aux standards et exigences strictes des compagnies d’assurance.
        </p>
        <p>
          Pour soumettre sa demande, le Client doit obligatoirement suivre les étapes suivantes :
        </p>
        <LegalList
          items={[
            "Renseigner ses coordonnées et l’adresse précise du sinistre.",
            "Compléter la description des dégâts (date du sinistre, pièces touchées dont parties communes, nature des travaux nécessaires).",
            "Téléverser un dossier photographique exploitable des dommages constatés (minimum 1 photo, idéalement 4 à 8 photos).",
            "Prendre connaissance et accepter les présentes CGV, en consentant explicitement à l’exécution immédiate de la prestation et à la renonciation de son droit de rétractation.",
            "Valider et payer sa commande de manière sécurisée en ligne.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Article 3 — Conditions financières et paiement">
        <p>
          Le service est proposé sous la forme d’un forfait fixe, unique et transparent de 82,90 €
          TTC (quatre-vingt-deux euros et quatre-vingt-dix centimes toutes taxes comprises).
        </p>
        <p>
          Le règlement est exigible en totalité dès la validation de la commande sur le Site. Les
          transactions s’effectuent de manière entièrement sécurisée par carte bancaire via la
          plateforme de paiement certifiée Stripe. Une facture acquittée est instantanément générée
          et envoyée par courrier électronique au Client dès confirmation du paiement.
        </p>
      </LegalSection>

      <LegalSection title="Article 4 — Livraison et délais d’exécution">
        <p>
          Le Prestataire s’engage à expédier le devis au format PDF à l’adresse e-mail renseignée
          par le Client dans un délai maximal de 48 heures ouvrées (hors week-ends et jours fériés),
          à compter de la validation du paiement et sous réserve de la réception de photographies
          pleinement exploitables.
        </p>
        <p>
          Si les clichés transmis s’avèrent flous ou insuffisants pour l’évaluation des surfaces, le
          Prestataire contactera sans délai le Client pour obtenir des éléments complémentaires. Le
          délai de livraison de 48 heures débutera dès réception des nouvelles photos conformes.
        </p>
      </LegalSection>

      <LegalSection title="Article 5 — Droit de rétractation et renonciation expresse">
        <p>
          Conformément à l’article L221-25 du Code de la consommation, un client souhaitant que la
          prestation de services débute immédiatement et soit exécutée avant la fin du délai légal
          de rétractation de quatorze (14) jours doit en formuler la demande expresse.
        </p>
        <p>
          En cochant les deux cases obligatoires lors de l’enregistrement de sa commande, le Client
          confirme sa demande d’exécution immédiate et renonce expressément à tout droit de
          rétractation une fois la prestation commencée ou exécutée.
        </p>
        <p>Mentions validées par le Client avant paiement :</p>
        <LegalList
          items={[
            "« J’accepte les Conditions Générales de Vente. »",
            "« Je demande l’exécution immédiate de la prestation et je renonce expressément à mon droit de rétractation de 14 jours pour que mon devis soit traité et livré sous 48 h. »",
          ]}
        />
      </LegalSection>

      <LegalSection title="Article 6 — Validité technique et limites du devis">
        <p>
          Le devis de travaux d’embellissement est établi de bonne foi et à titre purement indicatif
          sur la base exclusive des informations et des images transmises par le Client. Ce document
          ne constitue en aucun cas un rapport d’expertise technique, structurelle, une recherche de
          fuite, ou une attestation de conformité du bâtiment. Le Client reste seul responsable de
          faire identifier et réparer la cause du sinistre (la fuite) par un professionnel qualifié
          avant tout démarrage des travaux de rénovation.
        </p>
        <p>
          Les prix mentionnés sur le devis sont valables pour une durée maximale de trois (3) mois à
          compter de sa date d’émission.
        </p>
      </LegalSection>

      <LegalSection title="Article 7 — Limitation de responsabilité financière">
        <p>
          Le Client est seul garant de la sincérité et de la véracité des faits déclarés. La
          responsabilité du Prestataire ou de la plateforme ne saurait être engagée en cas de refus
          du devis par la compagnie d’assurance si ce rejet est lié à des déclarations
          volontairement tronquées, erronées ou des photos non représentatives de la réalité.
        </p>
        <p>
          En cas de litige engageant la responsabilité du Prestataire ou de la plateforme, le
          montant total des indemnités ou dommages et intérêts que le Prestataire pourrait être
          amené à verser au Client (particulier ou professionnel de l’immobilier) est strictement
          limité et plafonné à la somme payée par le Client pour la commande du service, soit 82,90
          € TTC.
        </p>
      </LegalSection>

      <LegalSection title="Article 8 — Force majeure et indisponibilité">
        <p>
          Le Prestataire ne pourra être tenu responsable d’un retard de livraison du devis si ce
          retard est dû à un cas de force majeure tel que défini par l’article 1218 du Code civil
          (notamment pannes réseau généralisées, cyberattaques bloquantes, indisponibilité technique
          majeure ou incapacité de joindre le Client).
        </p>
      </LegalSection>

      <LegalSection title="Article 9 — Confidentialité et données personnelles (RGPD)">
        <p>
          Le Site collecte uniquement les informations indispensables à la gestion du dossier et à
          la mise en page réglementaire du devis de travaux. Toutes les données sont traitées
          conformément à notre{" "}
          <Link href="/confidentialite" className="text-link hover:text-link-hover">
            Politique de confidentialité
          </Link>{" "}
          et au Règlement Général sur la Protection des Données (RGPD). Le Client dispose d’un droit
          d’accès, de rectification et d’effacement en écrivant à :{" "}
          <a
            href="mailto:support@olala-degatdeseaux.fr"
            className="text-link hover:text-link-hover"
          >
            support@olala-degatdeseaux.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Article 10 — Droit applicable et médiation">
        <p>
          Les présentes CGV sont régies par le droit français. En cas de réclamation, le Client est
          invité à contacter en priorité le service clientèle à l’adresse e-mail dédiée afin de
          trouver une issue amiable. À défaut de résolution amiable, le Client consommateur peut
          saisir gratuitement le Médiateur de la consommation compétent.
        </p>
      </LegalSection>
    </LegalShell>
  );
}

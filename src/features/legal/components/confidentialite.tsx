import { LegalList, LegalSection, LegalShell } from "./legal-shell";

/** Politique de confidentialité (RGPD) — client content, 2026-07-16 (spec 005). */
export function Confidentialite() {
  return (
    <LegalShell title="Politique de confidentialité" version="Version du 16 juillet 2026">
      <LegalSection title="1. Collecte des données personnelles">
        <p>
          Dans le cadre de l’utilisation du Site et de la commande de devis, l’éditeur (BEERI
          CAPITAL) est amené à collecter et traiter les données personnelles suivantes :
        </p>
        <LegalList
          items={[
            <>
              <strong>Données d’identification :</strong> nom, prénom, adresse e-mail, numéro de
              téléphone.
            </>,
            <>
              <strong>Données de situation :</strong> statut du demandeur (locataire, propriétaire,
              syndic, gérant d’immeuble), adresse du sinistre.
            </>,
            <>
              <strong>Données techniques et de sinistre :</strong> date approximative du sinistre,
              description des pièces endommagées, photographies des dégâts importées par
              l’utilisateur.
            </>,
            <>
              <strong>Données de paiement :</strong> les données de carte bancaire sont collectées
              et traitées de manière ultra-sécurisée exclusivement par notre partenaire de paiement
              certifié PCI-DSS, Stripe. L’éditeur ne conserve aucune coordonnée bancaire.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Finalité du traitement des données">
        <p>Ces données sont strictement nécessaires pour :</p>
        <LegalList
          items={[
            "L’analyse technique des dommages et la rédaction du devis officiel par la SAS BATITEC.",
            "La facturation et le traitement sécurisé du paiement par Stripe.",
            "La transmission du devis par e-mail et le suivi du dossier client.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Destinataires des données">
        <p>Les données personnelles collectées sont destinées exclusivement :</p>
        <LegalList
          items={[
            "Aux équipes internes pour la gestion de la plateforme.",
            "Aux professionnels qualifiés pour l’analyse technique et la signature du devis.",
          ]}
        />
        <p>Aucune donnée n’est vendue, louée ou cédée à des tiers à des fins commerciales.</p>
      </LegalSection>

      <LegalSection title="4. Durée de conservation des données">
        <p>
          Les données nécessaires à l’établissement du devis et à la facturation sont conservées
          pendant une durée de trois (3) ans à compter de la commande, afin de répondre aux
          obligations légales de facturation et de suivi technique d’assurance, sauf demande
          d’effacement anticipée du Client.
        </p>
        {/* Photo retention (client, 2026-07-22) — the windows the automated
            purge actually enforces, so the page and the code agree. */}
        <p>
          Les photographies transmises sont hébergées sur un espace de stockage privé, accessible
          uniquement au professionnel chargé du chiffrage. Elles sont supprimées automatiquement
          douze (12) mois après le paiement du dossier, et sept (7) jours après le dépôt lorsque le
          dossier n’a jamais été payé.
        </p>
      </LegalSection>

      <LegalSection title="5. Vos droits (RGPD)">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi «
          Informatique et Libertés », vous disposez d’un droit d’accès, de rectification, de
          portabilité, de limitation et de suppression de vos données personnelles.
        </p>
        <p>
          Vous pouvez exercer ces droits à tout moment en adressant votre demande par e-mail à :{" "}
          <a
            href="mailto:support@olala-degatdeseaux.fr"
            className="text-link hover:text-link-hover"
          >
            support@olala-degatdeseaux.fr
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}

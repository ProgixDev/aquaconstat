import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/** Full-bleed navy footer — brand, service nav, legal links, contact. */
export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-aqua-pale border-aqua-pale/10 border-t">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-72">
            <BrandLogo variant="dark" />
            <div className="text-aqua-pale/80 mt-4 text-sm leading-relaxed">
              Devis dégât des eaux à distance — France métropolitaine.
            </div>
          </div>
          <div>
            <div className="text-aqua-pale/60 tracking-eyebrow text-xs font-semibold uppercase">
              Service
            </div>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm">
              <a href="#comment-ca-marche" className="hover:text-secondary-foreground">
                Comment ça marche
              </a>
              <a href="#tarif" className="hover:text-secondary-foreground">
                Tarif
              </a>
              <a href="#faq" className="hover:text-secondary-foreground">
                FAQ
              </a>
              <Link href="/dossier" className="hover:text-secondary-foreground">
                Démarrer mon dossier
              </Link>
            </nav>
          </div>
          <div>
            <div className="text-aqua-pale/60 tracking-eyebrow text-xs font-semibold uppercase">
              Informations
            </div>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/mentions-legales" className="hover:text-secondary-foreground">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-secondary-foreground">
                CGV
              </Link>
              <Link href="/confidentialite" className="hover:text-secondary-foreground">
                Politique de confidentialité
              </Link>
            </nav>
          </div>
          <div>
            <div className="text-aqua-pale/60 tracking-eyebrow text-xs font-semibold uppercase">
              Contact
            </div>
            <div className="mt-4 text-sm leading-relaxed">
              contact@aquaconstat.fr
              <br />
              <span className="text-aqua-pale/80">
                Une question sur un dossier envoyé ? Répondez à votre e-mail de confirmation.
              </span>
            </div>
          </div>
        </div>
        <div className="border-aqua-pale/15 text-aqua-pale/80 mt-12 flex flex-wrap justify-between gap-3.5 border-t pt-6 text-xs">
          <span>© 2026 AquaConstat — nom de travail</span>
          <span>Paiement sécurisé par Stripe</span>
        </div>
      </div>
    </footer>
  );
}

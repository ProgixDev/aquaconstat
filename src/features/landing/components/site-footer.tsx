import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/**
 * Footer link with a thumb-sized hit area. The padding grows the target to
 * 28px and the negative inline margin lets it span the gutter without
 * shifting the text — so the visual rhythm is unchanged while the tap area
 * absorbs the space between rows. Bare 20px text passes WCAG 2.5.8 only via
 * the spacing exception; this passes on size.
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "hover:text-secondary-foreground -mx-2 rounded px-2 py-1 transition-colors";
  return href.startsWith("#") ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Full-bleed navy footer — brand, service nav, legal links, contact. */
export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-aqua-pale border-aqua-pale/10 border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        {/* Single column below sm is deliberate, not an oversight: at 320px a
            two-column nav gives 120px tracks, and « Politique de confidentialité »
            alone is 168px — it would wrap every long label to save height. */}
        <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
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
            {/* items-start: the hit area is as wide as its label, not the whole
                column — a full-width target next to a sibling column reads as a
                mis-hit waiting to happen. */}
            <nav className="mt-3 flex flex-col items-start gap-1 text-sm">
              <FooterLink href="#comment-ca-marche">Comment ça marche</FooterLink>
              <FooterLink href="#tarif">Tarif</FooterLink>
              <FooterLink href="#faq">FAQ</FooterLink>
              <FooterLink href="/dossier">Démarrer mon dossier</FooterLink>
            </nav>
          </div>
          <div>
            <div className="text-aqua-pale/60 tracking-eyebrow text-xs font-semibold uppercase">
              Informations
            </div>
            <nav className="mt-3 flex flex-col items-start gap-1 text-sm">
              <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
              <FooterLink href="/cgv">CGV</FooterLink>
              <FooterLink href="/confidentialite">Politique de confidentialité</FooterLink>
            </nav>
          </div>
          <div>
            <div className="text-aqua-pale/60 tracking-eyebrow text-xs font-semibold uppercase">
              Contact
            </div>
            <div className="mt-4 text-sm leading-relaxed">
              contact@olala.fr
              <br />
              <span className="text-aqua-pale/80">
                Une question sur un dossier envoyé ? Répondez à votre e-mail de confirmation.
              </span>
            </div>
          </div>
        </div>
        <div className="border-aqua-pale/15 text-aqua-pale/80 mt-10 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t pt-6 text-xs md:mt-12">
          <span>© 2026 Ôlala</span>
          <span>Paiement sécurisé par Stripe</span>
        </div>
      </div>
    </footer>
  );
}

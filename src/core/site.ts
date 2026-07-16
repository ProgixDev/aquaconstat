/**
 * Central site config — the single source for metadata, robots, sitemap, and
 * manifest. Replace name/description and set NEXT_PUBLIC_SITE_URL per app (it
 * drives canonical + Open Graph URLs).
 */
export const site = {
  name: "Ôlala",
  shortName: "Ôlala",
  title: "Ôlala - Devis dégât des eaux en ligne",
  description:
    "Devis dégât des eaux à distance — décrivez votre sinistre, ajoutez vos photos et recevez sous 48 h ouvrées un devis détaillé à transmettre à votre assurance. 149 €, 100 % en ligne.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /**
   * SEO is fail-closed: until NEXT_PUBLIC_SITE_URL names the real public
   * domain (not yet purchased, 2026-07-16), pages ship noindex and no
   * canonical — a localhost canonical in production told Google to index a
   * URL nobody can reach. Set the env var in the deployment and everything
   * (canonical, OG url, robots, sitemap host) lights up with no code change.
   */
  isPublic: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "fr_FR",
} as const;

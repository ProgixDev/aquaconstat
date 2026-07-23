/**
 * Central site config — the single source for metadata, robots, sitemap, and
 * manifest. Replace name/description and set NEXT_PUBLIC_SITE_URL per app (it
 * drives canonical + Open Graph URLs).
 */
export const site = {
  name: "Ôlala",
  shortName: "Ôlala",
  title: "Ôlala — Du sinistre à la solution | Devis dégât des eaux en ligne",
  description:
    "Ôlala, du sinistre à la solution : devis dégât des eaux à distance. Décrivez votre sinistre, ajoutez vos photos et recevez sous 48 h ouvrées un devis détaillé à transmettre à votre assurance. 82,90 €, 100 % en ligne.",
  // Trailing slash stripped so callers can freely do `${site.url}/sitemap.xml`
  // without producing `…app//sitemap.xml` when the env var ends in a slash.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
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

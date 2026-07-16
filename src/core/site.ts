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
  locale: "fr_FR",
} as const;

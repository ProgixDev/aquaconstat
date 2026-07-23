import type { MetadataRoute } from "next";
import { site } from "@/core/site";

export default function robots(): MetadataRoute.Robots {
  // Fail-closed: without the real domain (site.isPublic), crawlers are told
  // to stay out entirely — no sitemap/host pointing at localhost.
  if (!site.isPublic) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // /admin is the operator back-office and /dossier/paiement/demo is the
    // simulation stand-in — neither belongs in an index. (/account went with
    // the visitor-auth scaffolding, spec 006 AC-10.)
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/dossier/paiement/demo"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

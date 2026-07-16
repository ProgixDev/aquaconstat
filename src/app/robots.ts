import type { MetadataRoute } from "next";
import { site } from "@/core/site";

export default function robots(): MetadataRoute.Robots {
  // Fail-closed: without the real domain (site.isPublic), crawlers are told
  // to stay out entirely — no sitemap/host pointing at localhost.
  if (!site.isPublic) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

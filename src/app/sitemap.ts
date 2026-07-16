import type { MetadataRoute } from "next";
import { site } from "@/core/site";

/** Add a row per public, indexable route. Keep auth/account/api out. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Fail-closed: no localhost URLs in the sitemap while the real domain
  // is not configured (see site.isPublic).
  if (!site.isPublic) return [];
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}

import type { MetadataRoute } from "next";

import {
  buildAlternates,
  CALCULATOR_SLUGS,
  LOCALES,
  type CalculatorSlugPath,
} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const slug of CALCULATOR_SLUGS) {
      const typedSlug = slug as CalculatorSlugPath;
      const alternates = buildAlternates(locale, typedSlug);
      const isHome = slug === "";

      entries.push({
        url: alternates.canonical,
        lastModified,
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1 : 0.8,
        alternates: {
          languages: alternates.languages,
        },
      });
    }
  }

  return entries;
}

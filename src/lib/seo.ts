import type { Metadata } from "next";

import { CALCULATOR_SLUGS as CONFIG_SLUGS } from "@/config/calculators";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

export const SITE_URL = "https://rokmath.com";

export const LOCALES = locales;

/** Re-export: middleware redirects locale-less URLs here (rokmath.com → /en). */
export { defaultLocale };

/** hreflang x-default target — matches global default locale. */
export const X_DEFAULT: Locale = defaultLocale;

export const STATIC_PAGE_SLUGS = ["about", "contact"] as const;

export const CALCULATOR_SLUGS = [
  "",
  ...CONFIG_SLUGS,
  ...STATIC_PAGE_SLUGS,
] as const;

export type CalculatorSlugPath = (typeof CALCULATOR_SLUGS)[number];

const OG_LOCALE: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  es: "es_ES",
  ru: "ru_RU",
  vi: "vi_VN",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  de: "de_DE",
  fr: "fr_FR",
};

export function buildPath(slug: CalculatorSlugPath): string {
  return slug === "" ? "" : `/${slug}`;
}

export function buildUrl(locale: Locale, slug: CalculatorSlugPath): string {
  const path = slug === "" ? `/${locale}` : `/${locale}/${slug}`;
  return `${SITE_URL}${path}`;
}

export function buildAlternates(locale: Locale, slug: CalculatorSlugPath) {
  const languages: Record<string, string> = {};

  for (const loc of LOCALES) {
    languages[loc] = buildUrl(loc, slug);
  }

  languages["x-default"] = buildUrl(X_DEFAULT, slug);

  return {
    canonical: buildUrl(locale, slug),
    languages,
  };
}

export function buildPageMetadata(
  locale: Locale,
  slug: CalculatorSlugPath,
  meta: { title: string; description: string },
): Metadata {
  const url = buildUrl(locale, slug);
  const alternates = buildAlternates(locale, slug);

  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: "ROK Tools",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`/${locale}/opengraph-image`],
    },
  };
}

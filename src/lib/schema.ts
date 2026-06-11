import type { CalculatorSlug } from "@/config/calculators";
import type { CalculatorSeoFaqItem } from "@/i18n/calculator-seo";
import { intlNumberLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { LOGO_PATH } from "@/config/site";

import { SITE_URL, buildUrl, type CalculatorSlugPath } from "./seo";

export const LOGO_URL = `${SITE_URL}${LOGO_PATH}`;

const HOME_LABELS: Record<Locale, string> = {
  tr: "Ana Sayfa",
  en: "Home",
  es: "Inicio",
  ru: "Главная",
  vi: "Trang chủ",
  "zh-CN": "首页",
  "zh-TW": "首頁",
  de: "Startseite",
  fr: "Accueil",
};

function inLanguage(locale: Locale): string {
  return intlNumberLocales[locale];
}

function baseSchemas(locale: Locale, siteName: string) {
  return [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: siteName,
      url: SITE_URL,
      inLanguage: inLanguage(locale),
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: siteName,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  ];
}

function breadcrumbSchema(
  locale: Locale,
  pageName: string,
  slug: CalculatorSlugPath,
) {
  const pageUrl = buildUrl(locale, slug);
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: HOME_LABELS[locale],
        item: buildUrl(locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: pageUrl,
      },
    ],
  };
}

function webApplicationSchema(
  locale: Locale,
  slug: CalculatorSlug,
  name: string,
  description: string,
) {
  return {
    "@type": "WebApplication",
    name,
    description,
    url: buildUrl(locale, slug),
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    inLanguage: inLanguage(locale),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

function faqPageSchema(faq: Dictionary["home"]["faq"]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function calculatorFaqPageSchema(faq: CalculatorSeoFaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildCalculatorPageSchemaGraph(params: {
  locale: Locale;
  siteName: string;
  slug: CalculatorSlug;
  pageTitle: string;
  pageDescription: string;
  seoFaq?: CalculatorSeoFaqItem[];
}): Record<string, unknown>[] {
  const graph: Record<string, unknown>[] = [
    ...baseSchemas(params.locale, params.siteName),
    webApplicationSchema(
      params.locale,
      params.slug,
      params.pageTitle,
      params.pageDescription,
    ),
    breadcrumbSchema(params.locale, params.pageTitle, params.slug),
  ];

  if (params.seoFaq && params.seoFaq.length > 0) {
    graph.push(calculatorFaqPageSchema(params.seoFaq));
  }

  return graph;
}

export function buildHomePageSchemaGraph(params: {
  locale: Locale;
  siteName: string;
  faq: Dictionary["home"]["faq"];
}): Record<string, unknown>[] {
  return [...baseSchemas(params.locale, params.siteName), faqPageSchema(params.faq)];
}

export function buildAboutPageSchemaGraph(params: {
  locale: Locale;
  siteName: string;
  pageTitle: string;
  metaDescription: string;
  personDescription: string;
}): Record<string, unknown>[] {
  const pageUrl = buildUrl(params.locale, "about");

  return [
    ...baseSchemas(params.locale, params.siteName),
    {
      "@type": "AboutPage",
      "@id": pageUrl,
      name: params.pageTitle,
      description: params.metaDescription,
      url: pageUrl,
      inLanguage: inLanguage(params.locale),
      mainEntity: { "@id": `${pageUrl}#person` },
    },
    {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: "İsmail",
      description: params.personDescription,
    },
    breadcrumbSchema(params.locale, params.pageTitle, "about"),
  ];
}

export function buildContactPageSchemaGraph(params: {
  locale: Locale;
  siteName: string;
  pageTitle: string;
  metaDescription: string;
}): Record<string, unknown>[] {
  const pageUrl = buildUrl(params.locale, "contact");

  return [
    ...baseSchemas(params.locale, params.siteName),
    {
      "@type": "ContactPage",
      "@id": pageUrl,
      name: params.pageTitle,
      description: params.metaDescription,
      url: pageUrl,
      inLanguage: inLanguage(params.locale),
    },
    breadcrumbSchema(params.locale, params.pageTitle, "contact"),
  ];
}

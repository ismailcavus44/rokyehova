import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchPageClient } from "@/components/ResearchPageClient";
import { buildPageMetadata } from "@/lib/seo";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    return {};
  }
  const dict = await getDictionary(locale as Locale);
  return buildPageMetadata(locale as Locale, "research", {
    title: dict.research.meta.title,
    description: dict.research.meta.description,
  });
}

export default async function ResearchPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return <ResearchPageClient key={locale} dict={dict} locale={locale as Locale} />;
}

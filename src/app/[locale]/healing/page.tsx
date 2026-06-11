import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HealingPageClient } from "@/components/HealingPageClient";
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
  return buildPageMetadata(locale as Locale, "healing", {
    title: dict.healing.meta.title,
    description: dict.healing.meta.description,
  });
}

export default async function HealingPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return <HealingPageClient key={locale} dict={dict} locale={locale as Locale} />;
}

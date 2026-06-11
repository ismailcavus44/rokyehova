import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GemsPageClient } from "@/components/GemsPageClient";
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
  return buildPageMetadata(locale as Locale, "gems", {
    title: dict.gems.meta.title,
    description: dict.gems.meta.description,
  });
}

export default async function GemsPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return <GemsPageClient key={locale} dict={dict} locale={locale as Locale} />;
}

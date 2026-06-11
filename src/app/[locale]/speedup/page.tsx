import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpeedupPageClient } from "@/components/SpeedupPageClient";
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
  return buildPageMetadata(locale as Locale, "speedup", {
    title: dict.speedup.meta.title,
    description: dict.speedup.meta.description,
  });
}

export default async function SpeedupPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return <SpeedupPageClient key={locale} dict={dict} locale={locale as Locale} />;
}

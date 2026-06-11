import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPageClient } from "@/components/ContactPageClient";
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
  return buildPageMetadata(locale as Locale, "contact", {
    title: dict.contact.meta.title,
    description: dict.contact.meta.description,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <ContactPageClient key={locale} dict={dict} locale={locale as Locale} />
  );
}

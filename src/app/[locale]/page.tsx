import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomePage } from "@/components/HomePage";
import { SetHtmlLang } from "@/components/SetHtmlLang";
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
  return buildPageMetadata(locale as Locale, "", {
    title: dict.home.meta.title,
    description: dict.home.meta.description,
  });
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <SetHtmlLang locale={locale as Locale} />
      <div key={locale}>
        <Header
          locale={locale as Locale}
          header={dict.header}
          home={dict.home}
        />
        <HomePage
          locale={locale as Locale}
          siteName={dict.header.brand}
          home={dict.home}
        />
        <Footer brand={dict.header.brand} />
      </div>
    </>
  );
}

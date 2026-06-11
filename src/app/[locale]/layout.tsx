import type { Metadata } from "next";

import { Manrope } from "next/font/google";

import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo";

import { locales, type Locale } from "@/i18n/config";

import { getDictionary } from "@/i18n/get-dictionary";

import { SupportModalProvider } from "@/components/SupportModalProvider";

import "../globals.css";



const manrope = Manrope({

  subsets: ["latin", "latin-ext"],

  display: "swap",

  adjustFontFallback: true,

  variable: "--font-manrope",

});



type Props = {

  children: React.ReactNode;

  params: Promise<{ locale: string }>;

};



export async function generateStaticParams() {

  return locales.map((locale) => ({ locale }));

}



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



export default async function LocaleLayout({ children, params }: Props) {

  const { locale } = await params;



  if (!locales.includes(locale as Locale)) {

    notFound();

  }

  const dict = await getDictionary(locale as Locale);

  return (

    <html lang={locale} suppressHydrationWarning>

      <body className={manrope.className}>
        <SupportModalProvider support={dict.support}>
          {children}
        </SupportModalProvider>
      </body>

    </html>

  );

}


import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";

import { NotFoundPage } from "@/components/NotFoundPage";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocaleFromPathname } from "@/lib/resolve-locale-from-path";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default async function RootNotFound() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = pathname
    ? resolveLocaleFromPathname(pathname)
    : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={manrope.className}>
        <NotFoundPage locale={locale} copy={dict.notFound} />
      </body>
    </html>
  );
}

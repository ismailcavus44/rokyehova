import type { Metadata } from "next";
import { headers } from "next/headers";

import { NotFoundPage } from "@/components/NotFoundPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocaleFromPathname } from "@/lib/resolve-locale-from-path";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default async function LocaleNotFound() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = resolveLocaleFromPathname(pathname);
  const dict = await getDictionary(locale);

  return <NotFoundPage locale={locale} copy={dict.notFound} />;
}

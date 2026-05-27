import type tr from "./messages/tr.json";
import { locales, type Locale } from "./config";

export type Dictionary = typeof tr;

const loaders = Object.fromEntries(
  locales.map((locale) => [
    locale,
    () => import(`./messages/${locale}.json`).then((m) => m.default as Dictionary),
  ]),
) as Record<Locale, () => Promise<Dictionary>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

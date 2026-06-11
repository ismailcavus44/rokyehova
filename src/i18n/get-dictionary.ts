import type { CalculatorSeoContent } from "./calculator-seo";
import type tr from "./messages/tr.json";
import deMessages from "./messages/de.json";
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";
import frMessages from "./messages/fr.json";
import ruMessages from "./messages/ru.json";
import trMessages from "./messages/tr.json";
import viMessages from "./messages/vi.json";
import zhCNMessages from "./messages/zh-CN.json";
import zhTWMessages from "./messages/zh-TW.json";
import { type Locale } from "./config";

type TrDictionary = typeof tr;

/** Calculator SEO blocks — other locales may omit until translated. */
export type Dictionary = Omit<TrDictionary, "ap" | "speedup" | "gems"> & {
  ap?: Omit<TrDictionary["ap"], "seo"> & { seo?: CalculatorSeoContent };
  speedup: Omit<TrDictionary["speedup"], "seo"> & { seo?: CalculatorSeoContent };
  gems: Omit<TrDictionary["gems"], "seo"> & { seo?: CalculatorSeoContent };
};

const dictionaries: Record<Locale, Dictionary> = {
  tr: trMessages,
  en: enMessages as Dictionary,
  es: esMessages as Dictionary,
  ru: ruMessages as Dictionary,
  vi: viMessages as Dictionary,
  "zh-CN": zhCNMessages as Dictionary,
  "zh-TW": zhTWMessages as Dictionary,
  de: deMessages as Dictionary,
  fr: frMessages as Dictionary,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

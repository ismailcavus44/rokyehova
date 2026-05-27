/**
 * Yeni dil eklemek için:
 * 1. src/i18n/messages/{kod}.json dosyası oluşturun (tr.json örneğine bakın)
 * 2. Aşağıdaki `locales` dizisine kodu ekleyin
 * 3. `localeNames` içine görünen adı ekleyin
 */
export const locales = ["tr", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
};

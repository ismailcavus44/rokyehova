/**
 * Yeni dil eklemek için:
 * 1. src/i18n/messages/{kod}.json dosyası oluşturun (tr.json örneğine bakın)
 * 2. Aşağıdaki `locales` dizisine kodu ekleyin
 * 3. `localeNames` ve `intlNumberLocales` içine giriş ekleyin
 */
export const locales = [
  "tr",
  "en",
  "es",
  "ru",
  "vi",
  "zh-CN",
  "zh-TW",
  "de",
  "fr",
] as const;

export type Locale = (typeof locales)[number];

/** Middleware yönlendirmesi ve x-default hedefi */
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  ru: "Русский",
  vi: "Tiếng Việt",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  de: "Deutsch",
  fr: "Français",
};

/** Intl.NumberFormat BCP 47 etiketleri */
export const intlNumberLocales: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
  ru: "ru-RU",
  vi: "vi-VN",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  de: "de-DE",
  fr: "fr-FR",
};

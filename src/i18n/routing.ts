import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ro", "fr", "de", "es", "it", "ru", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ro: "Romana",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
});

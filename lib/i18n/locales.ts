export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = "en" as const;

// Make sure this matches the locales in middleware.ts
export const localeNames: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

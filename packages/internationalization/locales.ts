/** Pure locale metadata shared by routing, Studio, defaults, and UI controls. */
export const locales = ["en", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const languageLabels: Record<Locale, string> = {
  en: "🇬🇧 English",
  ja: "🇯🇵 日本語",
  zh: "🇨🇳 中文",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && locales.some((locale) => locale === value)
  );
}

export function resolveLocale(value: string): Locale {
  const language = value.toLowerCase().split("-")[0];
  return isLocale(language) ? language : defaultLocale;
}

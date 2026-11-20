import {
  defaultLocale,
  languageLabels,
  locales,
} from "@repo/internationalization/locales";

export const i18nLocales = locales.map((id) => ({
  id,
  title: languageLabels[id],
}));
export const defaultLocaleId = defaultLocale;

/** Document types that use @sanity/document-internationalization. */
export const localizedSchemaTypes = [
  "post",
  "project",
  "resume",
  "page",
] as const;

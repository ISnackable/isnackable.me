import type { Template, TemplateItem } from "sanity";
import { getPageInitialValue, pageRoutes } from "../content/pages";
import {
  defaultLocaleId,
  i18nLocales,
  localizedSchemaTypes,
} from "./localization";

export const pageTemplates: Template[] = pageRoutes.map((route) => ({
  id: `page-${route}-${defaultLocaleId}`,
  title: `${route} (English)`,
  schemaType: "page",
  value: getPageInitialValue(route, defaultLocaleId),
}));

// Each template already has a fixed language. Declaring template parameters
// would keep it out of Studio's generated creation menu.
export const localizedTemplates: Template[] = localizedSchemaTypes.flatMap(
  (schemaType) =>
    (schemaType === "page" ? [] : i18nLocales).map((locale) => ({
      id: `${schemaType}-${locale.id}`,
      title: `${schemaType} (${locale.title})`,
      schemaType,
      value: { language: locale.id },
    }))
);

/** Start in English; the document translation tool creates other languages. */
export function getNewDocumentOptions(items: TemplateItem[]) {
  return items.filter(
    (item) =>
      item.templateId !== "settings" &&
      (item.templateId.startsWith("page-")
        ? pageRoutes.some(
            (route) => item.templateId === `page-${route}-${defaultLocaleId}`
          )
        : !item.templateId.startsWith("page")) &&
      localizedSchemaTypes
        .filter((type) => type !== "page")
        .every((type) => {
          if (item.templateId === type) {
            return false;
          }
          return (
            !item.templateId.startsWith(`${type}-`) ||
            item.templateId === `${type}-${defaultLocaleId}`
          );
        })
  );
}

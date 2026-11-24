import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import pluralize from "pluralize-esm";
import { getPublishedId } from "sanity";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { pageLabels, pageRoutes } from "../content/pages";
import { defaultLocaleId, localizedSchemaTypes } from "./localization";

/**
 * Document types rendered explicitly as singletons or hidden from the
 * auto-generated desk list:
 * - `settings` — singleton beside Pages.
 * - `page` — route-specific entries under Pages.
 * - `resume`, `legalPage` — collections under Pages.
 * - `assist.instruction.context` — internal to Sanity Assist.
 * - `translation.metadata` — created by `documentInternationalization`;
 *   editors don't need to see it directly.
 */
const HIDDEN_TYPES = [
  "settings",
  "page",
  "resume",
  "legalPage",
  "assist.instruction.context",
  "translation.metadata",
];

function documentCollection(S: StructureBuilder, type: string, title: string) {
  const item = S.documentTypeListItem(type).title(title);
  const list = S.documentTypeList(type).title(title);
  const localized = localizedSchemaTypes.some((name) => name === type);
  return localized
    ? item.child(
        list
          .apiVersion("2026-06-21")
          .filter(
            type === "legalPage"
              ? "_type == $type && coalesce(language, $language) == $language"
              : "_type == $type && language == $language"
          )
          .params({ type, language: defaultLocaleId })
          .initialValueTemplates([
            S.initialValueTemplateItem(`${type}-${defaultLocaleId}`),
          ])
      )
    : item.child(list).showCount();
}

/**
 * Pages open their source document directly. Translated collections list only
 * the source language; the translation plugin navigates their other versions.
 * Other document types appear automatically.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .id("content")
    .title("Content")
    .items([
      S.listItem()
        .id("pages")
        .title("Pages")
        .icon(DocumentIcon)
        .child(
          S.list()
            .id("pages")
            .title("Pages")
            .items([
              ...pageRoutes.map((route) =>
                S.listItem()
                  .id(route)
                  .title(pageLabels[route])
                  .icon(DocumentIcon)
                  .child(async (_id, { structureContext }) => {
                    const documentId = await structureContext
                      .getClient({ apiVersion: "2026-06-21" })
                      .fetch<string | null>(
                        `*[_type == "page" && route == $route && language == $language]
                          | order(_createdAt asc, _id asc)[0]._id`,
                        { route, language: defaultLocaleId },
                        {
                          perspective: structureContext.perspectiveStack,
                          useCdn: false,
                        }
                      );
                    if (documentId) {
                      return S.document()
                        .id(route)
                        .schemaType("page")
                        .documentId(getPublishedId(documentId))
                        .title(pageLabels[route]);
                    }
                    // Fresh datasets still offer the route's creation template.
                    return S.documentTypeList("page")
                      .id(route)
                      .title(pageLabels[route])
                      .apiVersion("2026-06-21")
                      .filter(
                        '_type == "page" && route == $route && language == $language'
                      )
                      .params({ route, language: defaultLocaleId })
                      .initialValueTemplates([
                        S.initialValueTemplateItem(
                          `page-${route}-${defaultLocaleId}`
                        ),
                      ]);
                  })
              ),
              S.divider(),
              documentCollection(S, "resume", "Résumés"),
              documentCollection(S, "legalPage", "Legal pages"),
            ])
        ),
      S.listItem()
        .id("settings")
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("settings")
            .documentId("settings")
            .title("Site settings")
        ),
      S.divider(),
      ...S.documentTypeListItems()
        .filter((item) => !HIDDEN_TYPES.includes(item.getId() as string))
        .map((item) => {
          const type = item.getId() as string;
          const titles: Record<string, string> = {
            post: "All posts",
            project: "All projects",
          };
          const title = titles[type] ?? pluralize(item.getTitle() as string);
          return documentCollection(S, type, title);
        }),
    ]);

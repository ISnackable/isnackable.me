import { createSchema, type Source } from "sanity";
import {
  createStructureBuilder,
  DocumentBuilder,
  type DocumentList,
  DocumentTypeListBuilder,
  type List,
  ListBuilder,
  type StructureContext,
} from "sanity/structure";
import { schemaTypes } from "../schemas";
import { structure } from "../studio/structure";
import { localizedTemplates, pageTemplates } from "../studio/templates";

export type StudioPageFetcher = (
  query: string,
  params: Record<string, string>,
  options: {
    perspective: StructureContext["perspectiveStack"];
    useCdn: boolean;
  }
) => Promise<string | null>;

/** Exercise the real Sanity serializer without a network-backed Studio session. */
export function createStudioStructure(
  fetchDocumentId: StudioPageFetcher = async () => null
) {
  const source = {
    name: "test",
    projectId: "example",
    dataset: "test",
    schema: createSchema({
      name: "test",
      // The structure needs document identities; field/plugin schemas are irrelevant here.
      types: schemaTypes
        .filter((type) => type.type === "document")
        .map(({ name, title }) => ({
          name,
          title,
          type: "document",
          fields: [{ name: "title", type: "string" }],
        })),
    }),
    document: { singletons: [], resolveNewDocumentOptions: () => [] },
    templates: [...pageTemplates, ...localizedTemplates],
    getClient: () => ({ fetch: fetchDocumentId }),
    i18n: { t: (key: string) => key },
  } as unknown as Source;
  const builder = createStructureBuilder({
    source,
    perspectiveStack: ["published"],
  });
  const root = structure(
    builder,
    builder.context as unknown as Parameters<typeof structure>[1]
  );
  if (!(root instanceof ListBuilder)) {
    throw new Error("Expected the Studio root to be a list builder");
  }

  return { root: root.serialize(), context: builder.context };
}

export function serializeStudioStructure() {
  return createStudioStructure().root;
}

export async function resolveStudioPage(
  pages: List,
  route: string,
  context: StructureContext
) {
  const item = pages.items.find((entry) => entry.id === route);
  if (!(item?.type === "listItem" && typeof item.child === "function")) {
    throw new Error(`Expected a page resolver for ${route}`);
  }
  const child = await item.child(route, {
    parent: pages,
    index: 0,
    splitIndex: 0,
    path: ["content", "pages", route],
    params: {},
    structureContext: context,
  });
  if (
    !(
      child instanceof DocumentBuilder ||
      child instanceof DocumentTypeListBuilder
    )
  ) {
    throw new Error(`Expected a document or creation list for ${route}`);
  }
  return child.serialize();
}

export function childList(item: List["items"][number] | undefined): List {
  const child = item?.type === "listItem" ? item.child : null;
  if (
    !(
      child &&
      typeof child === "object" &&
      "type" in child &&
      child.type === "list"
    )
  ) {
    throw new Error(`Expected a child list for ${item?.id}`);
  }
  return child as List;
}

export function childDocumentList(
  item: List["items"][number] | undefined
): DocumentList {
  const child = item?.type === "listItem" ? item.child : null;
  if (
    !(
      child &&
      typeof child === "object" &&
      "type" in child &&
      child.type === "documentList"
    )
  ) {
    throw new Error(`Expected a document list for ${item?.id}`);
  }
  return child as DocumentList;
}

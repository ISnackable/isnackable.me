import type { PAGE_QUERY_RESULT } from "../sanity.types";

export interface ModuleAttributes {
  hidden?: boolean | null;
  uid?: string | null;
}

type PageSection = NonNullable<
  NonNullable<PAGE_QUERY_RESULT>["sections"]
>[number];
export const visualModuleTypes = [
  "calloutModule",
  "galleryModule",
  "quoteModule",
  "accordionModule",
] as const;

export type VisualModule = Extract<
  PageSection,
  { _type: (typeof visualModuleTypes)[number] }
>;
export function isVisualModule(value: {
  _type: string;
}): value is VisualModule {
  return visualModuleTypes.some((type) => type === value._type);
}
export type ModuleOf<T extends VisualModule["_type"]> = Extract<
  VisualModule,
  { _type: T }
>;
export type ModuleHeadingLevel = 2 | 3;

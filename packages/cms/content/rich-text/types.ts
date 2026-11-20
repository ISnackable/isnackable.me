import type { TypedObject } from "@portabletext/types";
import type { ModuleAttributes } from "../../modules/types";

/** Minimum shape needed by text analysis; visual modules have no span children. */
export interface RichTextNode extends TypedObject {
  attributes?: ModuleAttributes | null;
  children?: { text?: string }[] | null;
  style?: string | null;
}

import type { TypedObject } from "@portabletext/types";
import { type StegaCleaned, stegaClean } from "@sanity/client/stega";

type CleanModuleControls<T> = T extends {
  _type: "calloutModule";
  tone: infer Tone;
}
  ? Omit<T, "tone"> & { tone: StegaCleaned<Tone> }
  : T;

/** Normalize only control fields; preserve the rest of each document's query shape. */
export function cleanModuleControls<T extends TypedObject>(
  module: T
): CleanModuleControls<T> {
  const result =
    module._type === "calloutModule" && "tone" in module
      ? { ...module, tone: stegaClean(module.tone) }
      : module;
  // The conditional type distributes over query unions; the runtime branch matches it.
  return result as CleanModuleControls<T>;
}

/** Clean enum controls while preserving editable text's Visual Editing metadata. */
export function cleanArticleModules<T extends TypedObject>(
  content?: T[] | null
) {
  return content?.map(cleanModuleControls) ?? null;
}

import { stegaClean } from "@sanity/client/stega";
import type { ModuleAttributes } from "./types";

export const articleReservedIds = ["comments-heading"] as const;

/** Schema validation, rendering and heading allocation must agree on placement IDs. */
export function moduleAnchorId(
  key: string,
  attributes?: ModuleAttributes | null
) {
  return stegaClean(attributes?.uid) || `module-${key}`;
}

export function validateModuleAnchors(
  value: unknown,
  reserved: readonly string[] = []
): true | string {
  if (!Array.isArray(value)) {
    return true;
  }
  const ids = new Set(reserved);
  for (const node of value) {
    if (
      !(
        node &&
        typeof node === "object" &&
        typeof node._key === "string" &&
        typeof node._type === "string" &&
        (node._type.endsWith("Module") || node._type.endsWith("Section"))
      )
    ) {
      continue;
    }
    const anchors = [moduleAnchorId(node._key, node.attributes)];
    if (node._type === "aboutSection") {
      anchors.push("about", "about-heading");
    }
    for (const id of anchors) {
      if (ids.has(id)) {
        return `The anchor "${id}" is used more than once. Give each module a different anchor.`;
      }
      ids.add(id);
    }
  }
  return true;
}

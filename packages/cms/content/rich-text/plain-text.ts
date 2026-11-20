import type { TypedObject } from "@portabletext/types";
import { isVisualModule } from "../../modules/types";
import type { RichTextNode } from "./types";

function plainText(node: TypedObject): string {
  if (isVisualModule(node)) {
    if (node.attributes?.hidden) {
      return "";
    }
    switch (node._type) {
      case "calloutModule":
        return `${node.title ?? ""} ${toPlainText(node.body)}`;
      case "quoteModule":
        return [node.quote, node.attribution, node.sourceLabel]
          .filter(Boolean)
          .join(" ");
      case "galleryModule":
        return `${node.title ?? ""} ${node.images?.map((image) => image.caption ?? "").join(" ") ?? ""}`;
      case "accordionModule":
        return `${node.title ?? ""} ${node.items?.map((item) => `${item.title ?? ""} ${toPlainText(item.body)}`).join(" ") ?? ""}`;
      default:
        return "";
    }
  }
  const block = node as RichTextNode;
  if (block.attributes?.hidden) {
    return "";
  }
  if (block._type === "block") {
    return Array.isArray(block.children)
      ? block.children
          .map((span) => (typeof span?.text === "string" ? span.text : ""))
          .join("")
      : "";
  }
  return "";
}

/** Reader-visible text, including module content and excluding presentation fields. */
export function toPlainText(body?: readonly TypedObject[] | null): string {
  return body?.map(plainText).join("\n") ?? "";
}

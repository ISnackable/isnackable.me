import type { Locale } from "@repo/internationalization/locales";
import createDOMPurify, { type Config } from "dompurify";
import { marked } from "marked";
import { browseHref, filesApiHref, readBrowsePath } from "@/lib/files/paths";
import { markdownImageOrigins, previewType } from "@/lib/files/preview";

const markdownOrigin = "https://relative.invalid";
const linkProtocols = ["http:", "https:", "mailto:"];
const markdownHtml: Config = {
  ALLOWED_ATTR: [
    "align",
    "alt",
    "checked",
    "colspan",
    "disabled",
    "height",
    "href",
    "open",
    "rowspan",
    "src",
    "start",
    "title",
    "type",
    "width",
  ],
  ALLOWED_TAGS: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "dd",
    "del",
    "details",
    "div",
    "dl",
    "dt",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "input",
    "kbd",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ],
  ALLOW_DATA_ATTR: false,
};

function driveReference(href: string, folder: readonly string[]) {
  if (href.startsWith("//")) {
    return;
  }
  const base = new URL(
    `${folder.map(encodeURIComponent).join("/")}/`,
    markdownOrigin
  );
  const target = URL.parse(href, base);
  if (target?.origin === markdownOrigin) {
    const path = readBrowsePath(target.pathname.split("/").filter(Boolean));
    if (path) {
      return { hash: target.hash, path };
    }
  }
}

function linkHref(href: string, folder: readonly string[], locale: Locale) {
  if (href.startsWith("#")) {
    return href;
  }
  const target = URL.parse(href);
  if (target) {
    return linkProtocols.includes(target.protocol) ? target.href : undefined;
  }
  const reference = driveReference(href, folder);
  if (reference) {
    return browseHref(locale, reference.path) + reference.hash;
  }
}

function imageSource(src: string, folder: readonly string[]) {
  const target = URL.parse(src);
  if (target) {
    return target.protocol === "https:" &&
      markdownImageOrigins.some((origin) => origin === target.origin) &&
      !target.username &&
      !target.password
      ? target.href
      : undefined;
  }
  const reference = driveReference(src, folder);
  if (reference && previewType(reference.path.at(-1) ?? "").kind === "image") {
    return filesApiHref("content", reference.path, { preview: "1" });
  }
}

function renderMarkdown(
  body: string,
  folder: readonly string[],
  locale: Locale
) {
  const purifier = createDOMPurify(window);
  purifier.addHook("uponSanitizeAttribute", (_node, attribute) => {
    const { attrName, attrValue } = attribute;
    if (attrName === "href" || attrName === "src") {
      const url =
        attrName === "href"
          ? linkHref(attrValue, folder, locale)
          : imageSource(attrValue, folder);
      attribute.keepAttr = Boolean(url);
      attribute.attrValue = url ?? "";
    }
  });
  purifier.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "INPUT") {
      node.setAttribute("type", "checkbox");
      node.setAttribute("disabled", "");
    }
    if (node.nodeName === "IMG") {
      node.setAttribute("loading", "lazy");
    }
  });
  return purifier.sanitize(marked.parse(body, { async: false }), markdownHtml);
}

export function FileMarkdown({
  body,
  folder,
  locale,
}: {
  readonly body: string;
  readonly folder: readonly string[];
  readonly locale: Locale;
}) {
  const html = renderMarkdown(body, folder, locale);
  return (
    <div
      className="typeset overflow-x-auto wrap-break-word text-sm [&_div[align=center]_img]:inline-block"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify sanitizes the Markdown output before insertion.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

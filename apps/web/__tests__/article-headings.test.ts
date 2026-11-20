import {
  PortableText,
  type PortableTextBlock,
} from "@repo/cms/components/portable-text";
import {
  getHeadingAnchors,
  getTableOfContents,
} from "@repo/cms/content/rich-text/headings";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

test("article anchors match contents links for marked and CJK headings", () => {
  const content: PortableTextBlock[] = [
    {
      _type: "block",
      _key: "heading",
      style: "h2",
      markDefs: [],
      children: [
        { _type: "span", _key: "a", text: "Using ", marks: [] },
        { _type: "span", _key: "b", text: "TypeScript", marks: ["code"] },
        {
          _type: "span",
          _key: "c",
          text: " 読みやすい文章",
          marks: ["strong"],
        },
      ],
    },
  ];
  const html = renderToStaticMarkup(
    createElement(PortableText, { value: content })
  );
  const [item] = getTableOfContents(content);
  expect(item.url).toBe("using-typescript-読みやすい文章");
  expect(html).toContain(`id="${item.url}"`);
  expect(html).toContain("<code>TypeScript</code>");
  expect(html).toContain(`href="#${item.url}"`);
});

test("duplicate and punctuation-only headings keep unique links in rendered articles", () => {
  const content: PortableTextBlock[] = [
    "Hello",
    "Hello",
    "Hello-2",
    "!!!",
    "???",
    "日本語",
  ].map((text, index) => ({
    _type: "block",
    _key: `heading-${index}`,
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: "text", text, marks: [] }],
  }));
  const anchors = getHeadingAnchors(content);
  expect(anchors.map(({ id }) => id)).toEqual([
    "hello",
    "hello-2",
    "hello-2-2",
    "heading",
    "heading-2",
    "日本語",
  ]);
  const html = renderToStaticMarkup(
    createElement(PortableText, { value: content })
  );
  for (const item of getTableOfContents(content)) {
    expect(html).toContain(`id="${item.url}"`);
    expect(html).toContain(`href="#${item.url}"`);
  }
});

test("independent bodies can namespace their headings", () => {
  const content: PortableTextBlock[] = [
    {
      _type: "block",
      _key: "intro",
      style: "h2",
      markDefs: [],
      children: [{ _type: "span", _key: "a", text: "Overview", marks: [] }],
    },
  ];
  expect(
    renderToStaticMarkup(
      createElement(PortableText, { value: content, idPrefix: "notes-" })
    )
  ).toContain('href="#notes-overview"');
});

test("article heading IDs do not collide with the comments section", () => {
  const content: PortableTextBlock[] = [
    {
      _type: "block",
      _key: "heading",
      style: "h2",
      markDefs: [],
      children: [
        { _type: "span", _key: "span", text: "Comments heading", marks: [] },
      ],
    },
  ];
  expect(getTableOfContents(content)[0].url).toBe("comments-heading-2");
  expect(
    renderToStaticMarkup(createElement(PortableText, { value: content }))
  ).toContain('href="#comments-heading-2"');
});

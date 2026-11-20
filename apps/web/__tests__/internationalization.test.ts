import { getPageInitialValue } from "@repo/cms/content/pages";
import { getReadingTime } from "@repo/cms/content/rich-text/reading-time";
import { RESUME_LANGUAGES_QUERY } from "@repo/cms/queries";
import {
  i18nLocales,
  localizedSchemaTypes,
} from "@repo/cms/studio/localization";
import {
  getNewDocumentOptions,
  localizedTemplates,
} from "@repo/cms/studio/templates";
import languine from "@repo/internationalization/languine.json";
import {
  defaultLocale,
  locales,
  resolveLocale,
} from "@repo/internationalization/locales";
import en from "@repo/internationalization/messages/en.json";
import ja from "@repo/internationalization/messages/ja.json";
import zh from "@repo/internationalization/messages/zh.json";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";

const dictionaries = { en, ja, zh };
const TOKENS = /\{([^{}]+)\}/g;

function describeMessages(value: unknown, path = ""): Record<string, string> {
  if (typeof value === "string") {
    expect(value.trim().length, path).toBeGreaterThan(0);
    return {
      [path]: JSON.stringify(
        [...value.matchAll(TOKENS)].map((match) => match[1]).sort()
      ),
    };
  }
  if (value && typeof value === "object") {
    return Object.assign(
      {},
      ...Object.entries(value).map(([key, child]) =>
        describeMessages(child, `${path}.${key}`)
      )
    );
  }
  throw new Error(`Unexpected message value at ${path}`);
}

for (const locale of locales) {
  test(`${locale} messages have matching keys and interpolation tokens`, () => {
    expect(describeMessages(dictionaries[locale])).toEqual(
      describeMessages(en)
    );
  });

  test(`${locale} Studio page and reading labels agree`, () => {
    expect(getPageInitialValue("home", locale).language).toBe(locale);
    const readingTime = dictionaries[locale].web.content.readTime.replace(
      "{minutes}",
      String(getReadingTime([]))
    );
    expect(readingTime).not.toContain("{minutes}");
    expect(readingTime).toContain("1");
    if (locale !== "en") {
      expect(readingTime).not.toContain("min read");
    }
  });
}

test("routing, Studio, and the dictionary translation tool share the same languages", () => {
  expect(i18nLocales.map((locale) => locale.id)).toEqual(locales);
  expect(languine.locale.source).toBe(defaultLocale);
  expect(languine.locale.targets).toEqual(
    locales.filter((locale) => locale !== defaultLocale)
  );
});

test("Studio exposes English content templates and includes pages in the translation plugin", () => {
  expect(localizedSchemaTypes).toContain("page");
  expect(localizedSchemaTypes).not.toContain("profile");
  expect(localizedTemplates).toHaveLength(
    (localizedSchemaTypes.length - 1) * locales.length
  );
  expect(
    localizedTemplates.every((template) => !template.parameters?.length)
  ).toBe(true);
  const options = getNewDocumentOptions([
    ...localizedTemplates.map((template) => ({
      title: template.title,
      templateId: template.id,
    })),
    ...localizedSchemaTypes.map((type) => ({ templateId: type })),
    { templateId: "settings" },
  ]);
  expect(options.map((item) => item.templateId)).toEqual([
    ...localizedSchemaTypes
      .filter((type) => type !== "page")
      .map((type) => `${type}-en`),
  ]);
});

test("résumé metadata only advertises complete translations", async () => {
  const dataset = [
    { _type: "resume", language: "en", firstName: "Test", lastName: "User" },
    { _type: "resume", language: "ja", firstName: "", lastName: "User" },
    { _type: "resume", language: "zh", firstName: "Test" },
  ];
  const result = await (
    await evaluate(parse(RESUME_LANGUAGES_QUERY), { dataset })
  ).get();
  expect(result).toEqual([{ language: "en" }]);
});

test("regional and unsupported locales resolve consistently for dictionaries and page templates", () => {
  expect(resolveLocale("JA-jp")).toBe("ja");
  expect(resolveLocale("zh-CN")).toBe("zh");
  expect(getPageInitialValue("home", "zh-CN").language).toBe("zh");
  expect(resolveLocale("unsupported")).toBe(defaultLocale);
});

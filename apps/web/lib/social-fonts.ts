import { readFile } from "node:fs/promises";
import { join } from "node:path";
import notoJapanese from "@fontsource/noto-sans-jp/unicode.json";
import notoChinese from "@fontsource/noto-sans-sc/unicode.json";
import type { Locale } from "@repo/internationalization/locales";
import type { ImageResponse } from "next/og";

type Font = NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
>["fonts"];
type FontWeight = 400 | 700;

const han = /\p{Script=Han}/u;
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const eastAsianPunctuation = /^[\u3000-\u303f\uff01-\uffef]$/u;

function font(
  packageName: string,
  subset: string,
  name: string,
  weight: FontWeight
) {
  const filename = `${packageName}-${subset}-${weight}-normal.woff`;
  return readFile(
    join(
      process.cwd(),
      "node_modules",
      "@fontsource",
      packageName,
      "files",
      filename
    )
  ).then((data) => ({ name, data: Uint8Array.from(data).buffer, weight }));
}

const latinFonts = () =>
  Promise.all([
    font("arimo", "latin", "Arimo", 400),
    font("arimo", "latin", "Arimo", 700),
    font("arimo", "latin-ext", "Arimo Extended", 400),
    font("arimo", "latin-ext", "Arimo Extended", 700),
  ]);

function matchingSubsets(ranges: Record<string, string>, points: number[]) {
  return Object.entries(ranges).flatMap(([subset, range]) => {
    if (!subset.startsWith("[")) {
      return [];
    }
    const matches = range.split(",").some((interval) => {
      const [start, end = start] = interval.trim().slice(2).split("-");
      return points.some(
        (point) =>
          point >= Number.parseInt(start, 16) &&
          point <= Number.parseInt(end, 16)
      );
    });
    return matches ? [subset.slice(1, -1)] : [];
  });
}

/** Load only the installed CJK subsets needed by the text on this card. */
export async function getSocialFonts(
  text: string,
  locale: Locale
): Promise<Font> {
  const characters = [...new Set(text)];
  const points = characters
    .filter(
      (character) =>
        han.test(character) ||
        kana.test(character) ||
        eastAsianPunctuation.test(character)
    )
    .map((character) => character.codePointAt(0) as number);
  const japanese =
    locale === "ja" || characters.some((character) => kana.test(character));
  const packageName = japanese ? "noto-sans-jp" : "noto-sans-sc";
  const subsets = points.length
    ? matchingSubsets(japanese ? notoJapanese : notoChinese, points)
    : [];
  const [latin, cjk] = await Promise.all([
    latinFonts(),
    Promise.all(
      subsets.map((subset) => font(packageName, subset, `Noto ${subset}`, 700))
    ),
  ]);
  return [...latin, ...cjk];
}

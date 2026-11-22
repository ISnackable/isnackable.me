import "server-only";
import { cacheLife } from "next/cache";
import { type Locale, resolveLocale } from "./locales";
import type en from "./messages/en.json";

type Messages = typeof en;
export type Dictionary = Pick<Messages, "common" | "web">;
export type FilesMessages = Messages["files"];

// Static imports make missing keys in any locale a type error rather than a
// runtime English fallback hidden behind an untyped dynamic import.
const dictionaries: Record<Locale, () => Promise<Messages>> = {
  en: () => import("./messages/en.json").then((messages) => messages.default),
  ja: () => import("./messages/ja.json").then((messages) => messages.default),
  zh: () => import("./messages/zh.json").then((messages) => messages.default),
};

async function loadDictionary(locale: Locale): Promise<Messages> {
  "use cache";
  cacheLife("max");
  return await dictionaries[locale]();
}

export async function getDictionary(locale: string): Promise<Dictionary> {
  const { common, web } = await loadDictionary(resolveLocale(locale));
  return { common, web };
}

export async function getFilesDictionary(locale: Locale) {
  const { common, files } = await loadDictionary(locale);
  return { common, files };
}

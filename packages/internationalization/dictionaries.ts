import "server-only";
import { cacheLife } from "next/cache";
import { type Locale, resolveLocale } from "./locales";
import type en from "./messages/en.json";

export type Dictionary = typeof en;

// Static imports make missing keys in any locale a type error rather than a
// runtime English fallback hidden behind an untyped dynamic import.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((messages) => messages.default),
  ja: () => import("./messages/ja.json").then((messages) => messages.default),
  zh: () => import("./messages/zh.json").then((messages) => messages.default),
};

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  "use cache";
  cacheLife("max");
  return await dictionaries[resolveLocale(locale)]();
};

import type { Locale } from "./locales";

export function getPathnameWithoutLocale(pathname: string, locale: Locale) {
  const prefix = `/${locale}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
    ? pathname.slice(prefix.length) || "/"
    : null;
}

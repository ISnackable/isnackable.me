import type { Locale } from "@repo/internationalization/locales";

const DETAIL_PATH = /^\/(blog|projects)\/[^/]+\/?$/;

/** Keep translated deep links when available; otherwise show that locale's index. */
export function getLanguageSwitchPath(
  pathname: string,
  locale: Locale,
  alternates: Record<string, string>
) {
  const detail = DETAIL_PATH.exec(pathname);
  if (!detail) {
    return pathname;
  }
  const collection = detail[1];
  const alternate = alternates[locale];
  if (alternate) {
    try {
      const { pathname: translatedPath } = new URL(
        alternate,
        "https://local.invalid"
      );
      const prefix = `/${locale}/${collection}/`;
      if (
        translatedPath.startsWith(prefix) &&
        DETAIL_PATH.test(translatedPath.slice(locale.length + 1))
      ) {
        return translatedPath.slice(locale.length + 1);
      }
    } catch {
      // A malformed alternate must not produce a broken language switch.
    }
  }
  return `/${collection}`;
}

import type { Locale } from "@repo/internationalization/locales";
import { getPathnameWithoutLocale } from "@repo/internationalization/localized-pathname";

const DETAIL_PATH = /^\/(blog|projects)\/[^/]+\/?$/;

/** Keep translated deep links when available; otherwise show that locale's index. */
export function getPortfolioLanguageSwitchPath(
  pathname: string,
  targetLocale: Locale,
  alternate?: string
) {
  const detail = DETAIL_PATH.exec(pathname);
  if (!detail) {
    return pathname;
  }
  const collection = detail[1];
  if (alternate) {
    try {
      const url = new URL(alternate, "https://local.invalid");
      const translatedPath = getPathnameWithoutLocale(
        url.pathname,
        targetLocale
      );
      if (
        translatedPath?.startsWith(`/${collection}/`) &&
        DETAIL_PATH.test(translatedPath)
      ) {
        return translatedPath;
      }
    } catch {
      // A malformed alternate must not produce a broken language switch.
    }
  }
  return `/${collection}`;
}

"use client";

import { LanguageSwitcher } from "@repo/design-system/components/language-switcher";
import type { Locale } from "@repo/internationalization/locales";
import { getPathnameWithoutLocale } from "@repo/internationalization/localized-pathname";
import { useRouter } from "@repo/internationalization/navigation";
import { getPortfolioLanguageSwitchPath } from "@/i18n/switch-path";

export function PortfolioLanguageSwitcher({
  label,
  locale,
}: {
  readonly label: string;
  readonly locale: Locale;
}) {
  const router = useRouter();

  function changeLanguage(targetLocale: Locale) {
    const pathname = getPathnameWithoutLocale(window.location.pathname, locale);
    if (!pathname) {
      return;
    }

    const alternate = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${targetLocale}"]`
    )?.href;
    router.replace(
      getPortfolioLanguageSwitchPath(pathname, targetLocale, alternate),
      { locale: targetLocale }
    );
  }

  return (
    <LanguageSwitcher
      currentLocale={locale}
      label={label}
      onLocaleChange={changeLanguage}
    />
  );
}

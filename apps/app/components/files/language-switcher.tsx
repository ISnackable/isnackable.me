"use client";

import { LanguageSwitcher } from "@repo/design-system/components/language-switcher";
import type { Locale } from "@repo/internationalization/locales";
import { getPathnameWithoutLocale } from "@repo/internationalization/localized-pathname";
import { useRouter } from "next/navigation";

export function FilesLanguageSwitcher({
  label,
  locale,
}: {
  readonly label: string;
  readonly locale: Locale;
}) {
  const router = useRouter();

  function changeLanguage(targetLocale: Locale) {
    const { pathname, search, hash } = window.location;
    const path = getPathnameWithoutLocale(pathname, locale);
    if (!path) {
      return;
    }

    const href = `/${targetLocale}${path}${search}${hash}`;
    if (hash) {
      // Next can append a second fragment when revisiting a cached URL.
      window.location.assign(href);
    } else {
      router.push(href);
    }
  }

  return (
    <LanguageSwitcher
      currentLocale={locale}
      label={label}
      onLocaleChange={changeLanguage}
    />
  );
}

"use client";

import { LanguageSwitcher } from "@repo/design-system/components/language-switcher";
import type { Locale } from "@repo/internationalization/locales";
import { usePathname, useRouter } from "@repo/internationalization/navigation";
import { getLanguageSwitchPath } from "@/i18n/switch-path";

export function SiteLanguageSwitcher({
  label,
  locale,
}: {
  readonly label: string;
  readonly locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <LanguageSwitcher
      currentLocale={locale}
      label={label}
      onLocaleChange={(target) => {
        const alternates = Object.fromEntries(
          Array.from(
            document.querySelectorAll<HTMLLinkElement>(
              'link[rel="alternate"][hreflang]'
            )
          ).map((link) => [link.hreflang, link.href])
        );
        router.replace(getLanguageSwitchPath(pathname, target, alternates), {
          locale: target,
        });
      }}
    />
  );
}

import { SanitySiteName } from "@repo/cms/components/sanity-site-name";
import { siteConfig } from "@repo/config/site";
import { getBaseUrl } from "@repo/config/url";
import { SiteHeader } from "@repo/design-system/components/site-header";
import type { FilesDictionary } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { env, hasFilesCms } from "@/env";
import { browseHref } from "@/lib/files/paths";
import { FilesLanguageSwitcher } from "./language-switcher";

export function FilesHeader({
  dictionary,
  locale,
}: {
  readonly dictionary: FilesDictionary;
  readonly locale: Locale;
}) {
  const { common } = dictionary;

  return (
    <SiteHeader
      filesLink={{ href: browseHref(locale), current: true }}
      languageSwitcher={
        <FilesLanguageSwitcher label={common.switchLanguage} locale={locale} />
      }
      locale={locale}
      messages={common}
      portfolioOrigin={getBaseUrl(env.NEXT_PUBLIC_WEB_URL).origin}
      siteName={
        hasFilesCms ? (
          <SanitySiteName
            fetchOptions={{ perspective: "published", stega: false }}
          />
        ) : (
          siteConfig.name
        )
      }
    />
  );
}

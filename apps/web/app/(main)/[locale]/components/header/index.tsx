import { SanitySiteName } from "@repo/cms/components/sanity-site-name";
import { getBaseUrl } from "@repo/config/url";
import { SiteHeader } from "@repo/design-system/components/site-header";
import type { Locale, PortfolioDictionary } from "@repo/internationalization";
import { env } from "@/env";
import { siteUrl } from "@/lib/site-url";
import { PortfolioLanguageSwitcher } from "./language-switcher";

export function PortfolioHeader({
  dictionary,
  locale,
}: {
  dictionary: PortfolioDictionary;
  locale: Locale;
}) {
  const { common } = dictionary;
  const filesUrl = getBaseUrl(env.NEXT_PUBLIC_APP_URL, "http://localhost:3000");
  const filesLink =
    filesUrl.origin === siteUrl.origin
      ? undefined
      : { href: new URL(`/${locale}/browse`, filesUrl).href, external: true };

  return (
    <SiteHeader
      filesLink={filesLink}
      languageSwitcher={
        <PortfolioLanguageSwitcher
          label={common.switchLanguage}
          locale={locale}
        />
      }
      locale={locale}
      messages={common}
      siteName={<SanitySiteName />}
    />
  );
}

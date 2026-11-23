import { SanitySiteName } from "@repo/cms/components/sanity-site-name";
import { filesHref } from "@repo/config/url";
import { SiteHeader } from "@repo/design-system/components/site-header";
import type { Locale, PortfolioDictionary } from "@repo/internationalization";
import { PortfolioLanguageSwitcher } from "./language-switcher";

export function PortfolioHeader({
  dictionary,
  locale,
}: {
  dictionary: PortfolioDictionary;
  locale: Locale;
}) {
  const { common } = dictionary;
  return (
    <SiteHeader
      filesLink={{ href: filesHref(locale), navigation: "document" }}
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

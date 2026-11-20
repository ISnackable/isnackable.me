import "./styles.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { settings } from "@repo/cms";
import { resolveSiteSettings } from "@repo/cms/content/site";
import { SanityLive } from "@repo/cms/live";
import { siteConfig } from "@repo/config/site";
import { fonts } from "@repo/design-system/lib/fonts";
import { cn } from "@repo/design-system/lib/utils";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import {
  getDictionary,
  NextIntlClientProvider,
  routing,
} from "@repo/internationalization";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { type ReactNode, Suspense } from "react";
import { getSiteLocale } from "@/i18n/locale";
import { siteUrl } from "@/lib/site-url";
import { DraftTools } from "./components/draft-tools";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

interface LocaleLayoutProperties {
  readonly children: ReactNode;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = { metadataBase: siteUrl };

const LocaleLayout = async ({ children }: LocaleLayoutProperties) => {
  const locale = await getSiteLocale();

  const dictionary = await getDictionary(locale);

  return (
    <html
      className={cn(fonts, "scroll-smooth")}
      data-scroll-behavior="smooth"
      lang={locale}
      suppressHydrationWarning
    >
      <body className="portfolio-theme">
        <AnalyticsProvider>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={dictionary}>
              <Suspense
                fallback={
                  <Header dictionary={dictionary} siteName={siteConfig.name} />
                }
              >
                <SiteHeader dictionary={dictionary} />
              </Suspense>
              {children}
              <Suspense fallback={null}>
                <Footer dictionary={dictionary} locale={locale} />
              </Suspense>
              <Suspense fallback={null}>
                <LiveContent />
              </Suspense>
            </NextIntlClientProvider>
          </ThemeProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
};

async function SiteHeader({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const site = resolveSiteSettings(await settings.get());
  return <Header dictionary={dictionary} siteName={site.name} />;
}

async function LiveContent() {
  const { isEnabled } = await draftMode();
  return (
    <>
      {isEnabled ? <DraftTools /> : null}
      <SanityLive includeDrafts={isEnabled} onReconnect={false} />
    </>
  );
}

export default LocaleLayout;

import "./styles.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { SanityLive } from "@repo/cms/live";
import { fonts } from "@repo/design-system/lib/fonts";
import { cn } from "@repo/design-system/lib/utils";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import {
  getPortfolioDictionary,
  NextIntlClientProvider,
  routing,
} from "@repo/internationalization";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { type ReactNode, Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import { siteUrl } from "@/lib/site-url";
import { DraftTools } from "./components/draft-tools";
import { Footer } from "./components/footer";
import { PortfolioHeader } from "./components/header";

interface LocaleLayoutProperties {
  readonly children: ReactNode;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = { metadataBase: siteUrl };

const LocaleLayout = async ({ children }: LocaleLayoutProperties) => {
  const locale = await getPortfolioLocale();

  const dictionary = await getPortfolioDictionary(locale);

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
              <PortfolioHeader dictionary={dictionary} locale={locale} />
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

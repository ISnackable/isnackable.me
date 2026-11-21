import "./styles.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { getBaseUrl } from "@repo/config/url";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: getBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    "http://localhost:3000"
  ),
};

interface RootLayoutProperties {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body>
      <AnalyticsProvider>
        <DesignSystemProvider>{children}</DesignSystemProvider>
      </AnalyticsProvider>
    </body>
  </html>
);

export default RootLayout;

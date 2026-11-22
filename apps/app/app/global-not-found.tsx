import "./styles.css";
import { getBaseUrl } from "@repo/config/url";
import { NotFound } from "@repo/design-system/components/ui/not-found";
import { fonts } from "@repo/design-system/lib/fonts";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: getBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000"
  ),
  robots: { index: false, follow: false },
  title: "Page not found",
};

export default function GlobalNotFound() {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body className="portfolio-theme">
        <ThemeProvider>
          <NotFound className="min-h-svh" homeHref="/en/browse" />
        </ThemeProvider>
      </body>
    </html>
  );
}

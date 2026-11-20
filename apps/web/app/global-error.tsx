"use client";

import "./(main)/[locale]/styles.css";
import { NotFound } from "@repo/design-system/components/ui/not-found";
import { fonts } from "@repo/design-system/lib/fonts";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import { captureClientException } from "@repo/observability/client";
import { useEffect } from "react";

interface GlobalErrorProperties {
  readonly error: unknown;
  readonly retry: () => void;
}

const GlobalError = ({ error, retry }: GlobalErrorProperties) => {
  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body className="portfolio-theme">
        <title>500 · Something went wrong</title>
        <ThemeProvider>
          <NotFound
            actionLabel="Try again"
            className="min-h-svh"
            description="Try loading the page again, or return home."
            errorCode="500"
            onAction={retry}
            secondaryActionLabel="Back to home"
            secondaryHref="/"
            title="Something went wrong"
          />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default GlobalError;

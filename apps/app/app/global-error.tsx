"use client";

import "./styles.css";
import { filesHref } from "@repo/config/url";
import { NotFound } from "@repo/design-system/components/ui/not-found";
import { fonts } from "@repo/design-system/lib/fonts";
import { ThemeProvider } from "@repo/design-system/providers/theme";

interface GlobalErrorProperties {
  readonly reset: () => void;
}

const GlobalError = ({ reset }: GlobalErrorProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body>
      <title>500 · Something went wrong</title>
      <ThemeProvider>
        <NotFound
          actionLabel="Try again"
          className="min-h-svh"
          description="Try loading the page again, or return home."
          errorCode="500"
          onAction={reset}
          secondaryActionLabel="Back to home"
          secondaryHref={filesHref("en")}
          title="Something went wrong"
        />
      </ThemeProvider>
    </body>
  </html>
);

export default GlobalError;

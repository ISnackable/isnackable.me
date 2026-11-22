import "../styles.css";
import { getBaseUrl } from "@repo/config/url";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import { getFilesDictionary } from "@repo/internationalization/dictionaries";
import { locales } from "@repo/internationalization/locales";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FilesCache } from "@/components/files/cache";
import { FilesHeader } from "@/components/files/header";
import { env } from "@/env";
import { getFilesLocale } from "@/i18n/locale";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { files } = await getFilesDictionary(await getFilesLocale());
  return {
    metadataBase: getBaseUrl(env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"),
    robots: { index: false, follow: false },
    title: files.title,
  };
}

export default async function FilesLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const locale = await getFilesLocale();
  const dictionary = await getFilesDictionary(locale);
  return (
    <html className={fonts} lang={locale} suppressHydrationWarning>
      <body className="portfolio-theme">
        <DesignSystemProvider>
          <FilesHeader dictionary={dictionary} locale={locale} />
          <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-7 pb-16 sm:px-6 sm:pt-10">
            <FilesCache>{children}</FilesCache>
          </main>
        </DesignSystemProvider>
      </body>
    </html>
  );
}

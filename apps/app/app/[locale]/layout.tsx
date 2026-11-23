import "../styles.css";
import { siteConfig } from "@repo/config/site";
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
  const { assetPrefix } = siteConfig.files;
  return {
    metadataBase: getBaseUrl(env.NEXT_PUBLIC_WEB_URL),
    icons: {
      apple: `${assetPrefix}/apple-icon.png`,
      icon: [
        `${assetPrefix}/favicon.ico`,
        { url: `${assetPrefix}/icon.png`, type: "image/png" },
      ],
    },
    openGraph: { images: [`${assetPrefix}/opengraph-image`] },
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

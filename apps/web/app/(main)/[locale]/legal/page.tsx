import { legal } from "@repo/cms";
import { defaultLocale } from "@repo/internationalization/locales";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import ContentLoading from "../components/content-loading";

export const ensureStatic = "navigation";

async function LegalIndex(): Promise<never> {
  const locale = await getPortfolioLocale();
  const [localizedPage] = await legal.getPostsMeta(locale);
  if (localizedPage) {
    redirect(`/${locale}/legal/${encodeURIComponent(localizedPage.slug)}`);
  }

  if (locale !== defaultLocale) {
    const [sourcePage] = await legal.getPostsMeta(defaultLocale);
    if (sourcePage) {
      redirect(
        `/${defaultLocale}/legal/${encodeURIComponent(sourcePage.slug)}`
      );
    }
  }

  notFound();
}

export default function Page() {
  return (
    <Suspense fallback={<ContentLoading variant="legal" />}>
      <LegalIndex />
    </Suspense>
  );
}

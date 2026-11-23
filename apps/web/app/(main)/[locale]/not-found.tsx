import { NotFound } from "@repo/design-system/components/ui/not-found";
import { getPortfolioDictionary } from "@repo/internationalization/dictionaries";
import { getPortfolioLocale } from "@/i18n/locale";

export default async function SiteNotFound() {
  const locale = await getPortfolioLocale();
  const { errors } = (await getPortfolioDictionary(locale)).web;

  return (
    <NotFound
      actionLabel={errors.home}
      description={errors.notFoundDescription}
      homeHref={`/${locale}`}
      title={errors.notFoundTitle}
    />
  );
}

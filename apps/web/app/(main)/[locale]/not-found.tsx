import { NotFound } from "@repo/design-system/components/ui/not-found";
import { getDictionary } from "@repo/internationalization/dictionaries";
import { getSiteLocale } from "@/i18n/locale";

export default async function SiteNotFound() {
  const locale = await getSiteLocale();
  const { errors } = (await getDictionary(locale)).web;

  return (
    <NotFound
      actionLabel={errors.home}
      description={errors.notFoundDescription}
      homeHref={`/${locale}`}
      title={errors.notFoundTitle}
    />
  );
}

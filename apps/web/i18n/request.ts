import {
  getPortfolioDictionary,
  getRequestConfig,
  hasLocale,
  routing,
} from "@repo/internationalization";
import { locale as getRootLocale } from "next/root-params";

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const requested = explicitLocale ?? (await getRootLocale());
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return { locale, messages: await getPortfolioDictionary(locale) };
});

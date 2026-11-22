export { hasLocale, NextIntlClientProvider } from "next-intl";
export {
  getLocale,
  getRequestConfig,
  getTranslations,
} from "next-intl/server";
export {
  getPortfolioDictionary,
  type PortfolioDictionary,
} from "./dictionaries";
export {
  getPathname,
  Link,
  redirect,
  useRouter,
} from "./navigation";
export type { Locale } from "./routing";
export { locales, routing } from "./routing";

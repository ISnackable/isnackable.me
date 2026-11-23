import { siteConfig } from "./site";

const HTTP_PROTOCOL = /^https?:\/\//;

export function filesHref(locale: string) {
  return `/${locale}${siteConfig.files.path}`;
}

/** Vercel provides a hostname; local configuration may provide a full URL. */
export const getBaseUrl = (
  productionUrl: string | undefined,
  fallback = "http://localhost:3001"
): URL => {
  if (!productionUrl) {
    return new URL(fallback);
  }

  return new URL(
    HTTP_PROTOCOL.test(productionUrl)
      ? productionUrl
      : `https://${productionUrl}`
  );
};

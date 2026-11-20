import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Internationalization Next.js configuration.
 *
 * Wraps the config with the next-intl plugin, which links the request
 * configuration (`./i18n/request.ts` in the consuming app) to next-intl.
 *
 * The consuming app provides `i18n/request.ts` and resolves its locale using
 * `next/root-params`; the generated root getters are specific to that app.
 */
export const withInternationalization = (config: NextConfig): NextConfig =>
  createNextIntlPlugin("./i18n/request.ts")(config);

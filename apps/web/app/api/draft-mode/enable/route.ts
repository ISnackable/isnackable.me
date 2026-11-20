import { client } from "@repo/cms/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

/**
 * Enables Next.js Draft Mode when invoked by the Sanity Presentation Tool.
 * Pairs with the `previewUrl.previewMode.enable` path configured in
 * `packages/cms/sanity.config.ts`.
 *
 * Uses a tokened client so draft documents are readable.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_API_READ_TOKEN,
    ignoreBrowserTokenWarning: true,
  }),
});

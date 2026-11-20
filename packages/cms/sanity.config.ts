import { siteConfig } from "@repo/config/site";
import { getBaseUrl } from "@repo/config/url";
import { codeInput } from "@sanity/code-input";
import { colorInput } from "@sanity/color-input";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { media } from "sanity-plugin-media";
import { schemaTypes } from "./schemas/index";
import {
  SafeStudioField,
  SafeStudioInput,
  SafeStudioItem,
} from "./studio/components/safe-form-components";
import { i18nLocales, localizedSchemaTypes } from "./studio/localization";
import { resolve } from "./studio/presentation";
import { structure } from "./studio/structure";
import {
  getNewDocumentOptions,
  localizedTemplates,
  pageTemplates,
} from "./studio/templates";

// Read directly from process.env to avoid importing "server-only" guarded
// modules — the Studio config is consumed client-side via NextStudio.
const apiVersion = "2026-06-21";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";
const studioUrl = "/studio";

const prodUrl = (() => {
  const url =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_WEB_URL;
  if (url) {
    return getBaseUrl(url).origin;
  }
})();

export default defineConfig({
  name: "default",
  title: siteConfig.studio.title,

  projectId,
  dataset,
  apiVersion,

  basePath: studioUrl,

  plugins: [
    structureTool({ structure }),
    // Document-level internationalization for presentation content types.
    documentInternationalization({
      supportedLanguages: i18nLocales,
      schemaTypes: [...localizedSchemaTypes],
      languageField: "language",
      allowCreateMetaDoc: true,
      addTemplates: false,
    }),
    // Presentation tool configuration for Visual Editing
    presentationTool({
      resolve,
      previewUrl: {
        origin: prodUrl || "http://localhost:3001",
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    // Additional plugins for enhanced functionality
    visionTool(),
    codeInput(),
    colorInput(),
    media(),
    unsplashImageAsset(),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev, ...localizedTemplates, ...pageTemplates],
  },

  form: {
    components: {
      input: SafeStudioInput,
      field: SafeStudioField,
      item: SafeStudioItem,
    },
  },

  document: {
    newDocumentOptions: getNewDocumentOptions,
    actions: (prev, context) =>
      context.schemaType === "settings"
        ? prev.filter(
            (action) =>
              action.action !== "duplicate" && action.action !== "delete"
          )
        : prev,
  },
});

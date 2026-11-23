import { siteConfig } from "@repo/config/site";
import { codeInput } from "@sanity/code-input";
import { colorInput } from "@sanity/color-input";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
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

// The Studio build exposes these two public values to the client.
const apiVersion = "2026-06-21";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

export default defineConfig({
  name: "default",
  title: siteConfig.studio.title,

  projectId,
  dataset,
  apiVersion,

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
    internationalizedArray({
      languages: i18nLocales,
      fieldTypes: ["string"],
      languageDisplay: "titleOnly",
      restoreOrder: false,
    }),
    // Presentation tool configuration for Visual Editing
    presentationTool({
      resolve,
      previewUrl: {
        // The Studio and its preview share an origin.
        initial: "/",
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

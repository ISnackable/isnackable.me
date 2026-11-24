import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";
import { pageLabels } from "../content/pages";
import { defaultLocaleId } from "./localization";

/**
 * Maps document types to their frontend routes so the Presentation Tool
 * can navigate between Structure and live preview.
 *
 * Localized types (`post`, `resume`) resolve to `/:locale/...` routes
 * filtered by the document's `language` field.
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: { route: "route", language: "language", title: "title" },
      resolve: (doc) => ({
        locations: [
          {
            title:
              doc?.route === "home" ? pageLabels.home : doc?.title || "Page",
            href: `/${doc?.language || defaultLocaleId}${doc?.route === "home" ? "" : `/${doc?.route || ""}`}`,
          },
        ],
      }),
    }),
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
        language: "language",
      },
      resolve: (doc) => {
        if (!doc?.slug) {
          return { locations: [] };
        }
        const locale = doc.language || defaultLocaleId;
        return {
          locations: [
            {
              title: doc.title || "Untitled",
              href: `/${locale}/blog/${doc.slug}`,
            },
            { title: "Blog index", href: `/${locale}/blog` },
          ],
        };
      },
    }),
    legalPage: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
        language: "language",
      },
      resolve: (doc) => {
        if (!doc?.slug) {
          return { locations: [] };
        }
        return {
          locations: [
            {
              title: doc.title || "Untitled",
              href: `/${doc.language || defaultLocaleId}/legal/${doc.slug}`,
            },
          ],
        };
      },
    }),
    project: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
        language: "language",
      },
      resolve: (doc) => {
        if (!doc?.slug) {
          return { locations: [] };
        }
        const locale = doc.language || defaultLocaleId;
        return {
          locations: [
            {
              title: doc.title || "Untitled",
              href: `/${locale}/projects/${doc.slug}`,
            },
            { title: "Projects index", href: `/${locale}/projects` },
          ],
        };
      },
    }),
    resume: defineLocations({
      select: {
        title: "title",
        language: "language",
      },
      resolve: (doc) => {
        const locale = doc?.language || defaultLocaleId;
        return {
          locations: [
            { title: doc?.title || "Resume", href: `/${locale}/resume` },
          ],
        };
      },
    }),
  },

  // Configure which documents should open by default when navigating to a URL
  mainDocuments: defineDocuments([
    {
      route: "/:locale",
      filter: `_type == "page" && route == "home" && language == $locale`,
    },
    {
      route: "/:locale/blog",
      filter: `_type == "page" && route == "blog" && language == $locale`,
    },
    {
      route: "/:locale/projects",
      filter: `_type == "page" && route == "projects" && language == $locale`,
    },
    {
      route: "/:locale/resume",
      filter: `_type == "resume" && language == $locale`,
    },
    {
      route: "/:locale/blog/:slug",
      filter: `_type == "post" && language == $locale && slug.current == $slug`,
    },
    {
      route: "/:locale/projects/:slug",
      filter: `_type == "project" && language == $locale && slug.current == $slug`,
    },
    {
      route: "/:locale/legal/:slug",
      filter: `_type == "legalPage" && coalesce(language, "${defaultLocaleId}") == $locale && slug.current == $slug`,
    },
  ]),
};

import { resolveLocale } from "@repo/internationalization/locales";
import type { PAGE_QUERY_RESULT, Page } from "../sanity.types";

export type PageRoute = "home" | "blog" | "projects";
export type PageSection = NonNullable<
  NonNullable<PAGE_QUERY_RESULT>["sections"]
>[number];
export type HeroSectionContent = Extract<PageSection, { _type: "heroSection" }>;
export type AboutSectionContent = Extract<
  PageSection,
  { _type: "aboutSection" }
>;
export type ProjectsSectionContent = Extract<
  PageSection,
  { _type: "projectsSection" }
>;
export type WritingSectionContent = Extract<
  PageSection,
  { _type: "writingSection" }
>;

export const pageRoutes = ["home", "blog", "projects"] as const;
export const pageLabels: Record<PageRoute, string> = {
  home: "Home",
  blog: "Blog",
  projects: "Projects",
};
/** This blueprint contains section identities and no owner-specific content. */
export function getPageInitialValue(
  route: PageRoute,
  locale: string
): Pick<Page, "route" | "language" | "title" | "sections"> {
  const identity = {
    route,
    language: resolveLocale(locale),
  };
  if (route === "home") {
    return {
      ...identity,
      sections: [
        { _key: "hero", _type: "heroSection" },
        { _key: "about", _type: "aboutSection" },
        { _key: "projects", _type: "projectsSection", limit: 3 },
        { _key: "writing", _type: "writingSection", limit: 3 },
      ],
    };
  }
  return { ...identity, title: pageLabels[route] };
}

/** Neutral shells for an unconfigured dataset. A published empty array stays empty. */
export function getDefaultHomeSections(): PageSection[] {
  return [
    {
      _key: "hero",
      _type: "heroSection",
      attributes: null,
      displayName: null,
      tagline: null,
      nameGraphic: null,
      terminalUser: null,
      terminalInterests: null,
      featureImage: null,
      sticker: null,
      badge: null,
      gallery: null,
      galleryCaption: null,
      folderLabel: null,
      folderItems: null,
      tracks: null,
    },
    {
      _key: "about",
      _type: "aboutSection",
      attributes: null,
      headline: null,
      biography: null,
      interests: null,
    },
    {
      _key: "projects",
      _type: "projectsSection",
      attributes: null,
      title: null,
      description: null,
      limit: 3,
    },
    {
      _key: "writing",
      _type: "writingSection",
      attributes: null,
      title: null,
      description: null,
      limit: 3,
    },
  ];
}

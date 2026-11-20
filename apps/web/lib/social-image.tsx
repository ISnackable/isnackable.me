import { contentText } from "@repo/cms/content/text";
import { isLocale, type Locale } from "@repo/internationalization/locales";
import { Grid, socialCardSize } from "@repo/seo/social-card/grid";
import { ImageResponse } from "next/og";
import { getSeoContent, getSeoSite, type SeoRoute } from "./metadata";
import { siteUrl } from "./site-url";
import { getSocialFonts } from "./social-fonts";

const labels = {
  en: {
    home: "Portfolio",
    blog: "Writing",
    post: "Article",
    projects: "Projects",
    project: "Project",
    resume: "Résumé",
    legal: "Legal",
  },
  ja: {
    home: "ポートフォリオ",
    blog: "ブログ",
    post: "記事",
    projects: "プロジェクト",
    project: "プロジェクト",
    resume: "履歴書",
    legal: "法的情報",
  },
  zh: {
    home: "个人作品集",
    blog: "博客",
    post: "文章",
    projects: "项目",
    project: "项目",
    resume: "简历",
    legal: "法律信息",
  },
} satisfies Record<Locale, Record<SeoRoute["kind"], string>>;

function shorten(value: string | null | undefined, maxLength: number) {
  const characters = Array.from(contentText(value).replace(/\s+/g, " "));
  return characters.length <= maxLength
    ? characters.join("")
    : `${characters
        .slice(0, maxLength - 1)
        .join("")
        .trimEnd()}…`;
}

async function renderImage(route: SeoRoute, locale: string) {
  if (!isLocale(locale)) {
    return new Response(null, { status: 404 });
  }
  const [content, site] = await Promise.all([
    getSeoContent(route, locale),
    getSeoSite(),
  ]);
  if (!content) {
    return new Response(null, { status: 404 });
  }

  const label = labels[locale][route.kind];
  const title = shorten(route.kind === "home" ? site.name : content.title, 104);
  const description = shorten(content.description || site.description, 140);
  const brand = shorten(site.name === title ? "" : site.name, 44);
  const host = siteUrl.hostname;
  const fonts = await getSocialFonts(
    [label, title, description, brand, host].join(" "),
    locale
  );

  return new ImageResponse(
    <Grid
      brand={brand}
      description={description}
      host={host}
      label={label}
      title={title}
    />,
    {
      ...socialCardSize,
      fonts,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export { socialCardSize as size } from "@repo/seo/social-card/grid";

/** Factory for locale-only metadata routes. */
export const sectionSocialImage =
  (kind: "home" | "blog" | "projects" | "resume") =>
  async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    return renderImage({ kind }, locale);
  };

/** Factory for localized slug-based metadata routes. */
export const entrySocialImage =
  (kind: "post" | "project" | "legal") =>
  async ({ params }: { params: Promise<{ locale: string; slug: string }> }) => {
    const { locale, slug } = await params;
    return renderImage({ kind, slug }, locale);
  };

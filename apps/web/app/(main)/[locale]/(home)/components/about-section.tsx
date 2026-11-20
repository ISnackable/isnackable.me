import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SanityImage } from "@repo/cms/components/sanity-image";
import { resolveAbout } from "@repo/cms/content/about";
import type { AboutSectionContent } from "@repo/cms/content/pages";
import type { SiteSettings } from "@repo/cms/content/site";
import { contentText } from "@repo/cms/content/text";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary } from "@repo/internationalization";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { AboutExplorer } from "./about-explorer";
import { ArtifactPlaceholder } from "./artifact-placeholder";
import { interestPresentation } from "./explorer-content";

export function AboutSection({
  dictionary,
  locale,
  section,
  site,
}: {
  section: AboutSectionContent;
  site: SiteSettings;
  dictionary: Dictionary;
  locale: string;
}) {
  const { about } = dictionary.web.home;
  const content = resolveAbout(section);
  if (!(content.headline || content.biography || content.interests.length)) {
    return null;
  }
  return (
    <section
      aria-labelledby="about-heading"
      className="about-section"
      id="about"
    >
      <AboutExplorer
        copy={about.exploration}
        introduction={
          <div className="flex flex-col items-start gap-7">
            <div className="flex flex-col gap-4">
              <p className="section-label">{about.heading}</p>
              <h2
                className="section-title whitespace-pre-line"
                id="about-heading"
              >
                {content.headline || about.heading}
              </h2>
            </div>
            <p className="max-w-xl text-pretty text-base text-muted-foreground leading-8">
              {content.biography}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ size: "lg" }))}
                href={`/${locale}/resume`}
              >
                {about.ctaLabel}
                <ArrowUpRightIcon data-icon="inline-end" />
              </Link>
              {site.social.github ? (
                <a
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" })
                  )}
                  href={site.social.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <GitHubLogoIcon data-icon="inline-start" />
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        }
        items={content.interests.map(({ image, ...interest }) => ({
          ...interest,
          hasImage: Boolean(image?.asset),
          caption: contentText(image?.caption) || null,
          visual: image?.asset ? (
            <SanityImage
              className="object-cover"
              fill
              height={650}
              image={image}
              sizes="(min-width: 768px) 520px, 100vw"
              width={1040}
            />
          ) : (
            <ArtifactPlaceholder
              kind={interestPresentation[interest.style].artwork}
            />
          ),
        }))}
      />
    </section>
  );
}

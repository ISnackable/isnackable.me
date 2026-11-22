import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { legal, settings } from "@repo/cms";
import { resolveSiteSettings } from "@repo/cms/content/site";
import { siteConfig } from "@repo/config/site";
import { SiteLogo } from "@repo/design-system/components/site-logo";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { PortfolioDictionary } from "@repo/internationalization";
import { cacheLife } from "next/cache";
import Link from "next/link";

interface FooterProps {
  dictionary: PortfolioDictionary;
  locale: string;
}

export async function Footer({ locale, dictionary }: FooterProps) {
  const [legalPages, document] = await Promise.all([
    legal.getPostsMeta(),
    settings.get(),
  ]);
  const site = resolveSiteSettings(document);
  const socialLinks = [
    {
      href: site.social.linkedin,
      label: "LinkedIn",
      icon: <LinkedInLogoIcon />,
    },
    { href: site.social.github, label: "GitHub", icon: <GitHubLogoIcon /> },
  ];

  const { navigation } = dictionary.common;
  const navLinks = [
    { href: `/${locale}`, label: navigation.home },
    { href: `/${locale}/blog`, label: navigation.blog },
    { href: `/${locale}/projects`, label: navigation.projects },
    ...legalPages.map((post) => ({
      href: `/${locale}/legal/${post.slug}`,
      label: post.title,
    })),
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex max-w-full select-none items-center gap-2">
            <SiteLogo className="size-5 shrink-0" />
            <span className="truncate font-semibold text-foreground tracking-tight">
              {site.name}
            </span>
          </div>
          <div className="flex items-center">
            {socialLinks
              .filter(({ href }) => Boolean(href))
              .map(({ href, label, icon }) => (
                <a
                  aria-label={label}
                  className={buttonVariants({ size: "icon", variant: "ghost" })}
                  href={href}
                  key={label}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {icon}
                </a>
              ))}
          </div>
        </div>

        <nav aria-label={dictionary.web.footer.navigation}>
          <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link className="hover:text-foreground" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-t px-4 py-4 text-muted-foreground text-sm md:px-6">
        <p>
          &copy; {await getCopyrightYear()}{" "}
          {site.publisher || dictionary.web.footer.copyrightHolder}
        </p>

        <p className="inline-flex flex-wrap items-center gap-1">
          <span>{dictionary.web.footer.builtBy}</span>
          <a
            aria-label={dictionary.web.footer.githubProfile.replace(
              "{name}",
              siteConfig.builtBy.name
            )}
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href={siteConfig.builtBy.url}
            rel="noreferrer noopener"
            target="_blank"
          >
            {/** biome-ignore lint/performance/noImgElement: Just a small image */}
            <img
              alt=""
              className="size-4 rounded-full"
              height={16}
              loading="lazy"
              src={`https://github.com/${siteConfig.builtBy.name.split("/").pop()}.png?size=32`}
              width={16}
            />
            {siteConfig.builtBy.name}
          </a>
        </p>
      </div>
    </footer>
  );
}

// biome-ignore lint/suspicious/useAwait: Next.js requires cached functions to be async.
async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

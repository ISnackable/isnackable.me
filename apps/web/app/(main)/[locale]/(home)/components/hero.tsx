import { getImageUrl, SanityImage } from "@repo/cms/components/sanity-image";
import { urlFor } from "@repo/cms/content/images";
import type { HeroSectionContent } from "@repo/cms/content/pages";
import {
  githubUsername,
  httpsUrl,
  type SiteSettings,
} from "@repo/cms/content/site";
import { contentText } from "@repo/cms/content/text";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary } from "@repo/internationalization";
import { stegaClean } from "@sanity/client/stega";
import Github from "@thesvg/react/github";
import { ArrowUpRightIcon, FileCode2Icon, FileTextIcon } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { getLanyardPreview } from "@/lib/lanyard-previews";
import { ContributionGraphServer } from "./contribution-graph.server";
import { Folder } from "./folder";
import layout from "./hero-layout.module.css";
import { Lanyard } from "./lanyard";
import { LANYARD_HERO_FOV } from "./lanyard-preview";
import { lanyardDictionary } from "./lanyard-profile";
import { MusicPlayer, type Track } from "./music-player-widget";
import { NameGraphic } from "./name-graphic";
import { PhotoCollage } from "./photo-collage";
import { Terminal } from "./terminal";

interface HeroProps {
  content: HeroSectionContent;
  dictionary: Dictionary;
  locale: string;
  site: SiteSettings;
}

export function Hero({ dictionary, content: hero, locale, site }: HeroProps) {
  const name =
    contentText(hero.displayName) || dictionary.web.home.hero.placeholderName;
  const badge = hero?.badge;
  const username = githubUsername(site.social.github);
  const collagePhotos = (hero.gallery ?? []).filter(
    (photo) => photo.asset?.url
  );
  const folderItems = (hero.folderItems ?? []).filter(
    (item) =>
      item.document &&
      contentText(item.document.title) &&
      contentText(item.document.slug) &&
      ["project", "post"].includes(item.document._type)
  );
  const tracks = getTracks(hero);
  const hasDecorations = [
    badge,
    hero.featureImage?.asset,
    hero.sticker?.asset,
    collagePhotos.length,
    folderItems.length,
    tracks.length,
    username,
    contentText(hero.terminalUser),
  ].some(Boolean);
  const identity = <HeroIdentity hero={hero} name={name} />;

  if (!hasDecorations) {
    return (
      <section className="site-shell flex min-h-[60dvh] items-center justify-center py-20">
        {identity}
      </section>
    );
  }

  return (
    <div className={cn(layout.scene, "hero-scene z-10")}>
      <div className={layout.stage}>
        <div className={layout.topRow}>
          {badge ? (
            <div className={layout.lanyard}>
              <HeroLanyard
                badge={badge}
                flipBack={dictionary.web.home.lanyard.flipBack}
                placeholderName={dictionary.web.home.lanyard.placeholderName}
              />
            </div>
          ) : null}
          <div className={layout.media}>
            {hero?.featureImage?.asset ? (
              <div
                className={cn(
                  layout.feature,
                  "rotate-[4deg] transition-transform duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:scale-105"
                )}
              >
                <SanityImage
                  className="object-contain"
                  fill
                  image={hero.featureImage}
                  priority
                  sizes="(min-width: 768px) 370px, (min-width: 480px) 240px, 200px"
                />
              </div>
            ) : null}
            {tracks.length ? (
              <div className={layout.music}>
                <MusicPlayer tracks={tracks} />
              </div>
            ) : null}
          </div>
        </div>
        <div className={cn(layout.identityRow, badge && layout.hasBadge)}>
          {site.social.github ? (
            <a
              aria-label="GitHub"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                layout.github,
                "hover:bg-transparent!"
              )}
              href={site.social.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github
                className="size-full text-foreground [&_path]:!fill-current"
                height="100%"
                width="100%"
              />
            </a>
          ) : null}

          <div className={layout.identity}>{identity}</div>
          {folderItems.length ? (
            <div className={layout.folder}>
              <Folder
                label={stegaClean(
                  contentText(hero.folderLabel) ||
                    dictionary.web.home.folder.label
                )}
              >
                {folderItems.slice(0, 3).map(({ _key, document }) => {
                  if (!document) {
                    return null;
                  }
                  const isProject = document._type === "project";
                  const Icon = isProject ? FileCode2Icon : FileTextIcon;
                  return (
                    <Link
                      className="hero-folder-card"
                      href={`/${locale}/${isProject ? "projects" : "blog"}/${encodeURIComponent(stegaClean(document.slug ?? ""))}`}
                      key={_key}
                    >
                      <span className="hero-folder-card-meta">
                        <Icon aria-hidden="true" />
                        <span>
                          {isProject
                            ? dictionary.web.home.folder.project
                            : dictionary.web.home.folder.article}
                        </span>
                        <ArrowUpRightIcon aria-hidden="true" />
                      </span>
                      <span className="hero-folder-card-title">
                        {document.title}
                      </span>
                      {contentText(document.summary) ? (
                        <span className="hero-folder-card-summary">
                          {document.summary}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </Folder>
            </div>
          ) : null}
        </div>
        {contentText(hero?.terminalUser) ? (
          <div className={layout.terminal}>
            <div className={layout.terminalBody}>
              <Terminal
                interests={stegaClean(hero?.terminalInterests ?? "")}
                user={stegaClean(hero?.terminalUser ?? "")}
              />
            </div>
          </div>
        ) : null}
        {username ? (
          <div className={layout.contributions}>
            <div
              className={cn(
                layout.contributionsPanel,
                "rounded-lg border bg-background p-2"
              )}
            >
              <ContributionGraphServer
                label={dictionary.web.home.contributionsLabel}
                unavailableLabel={dictionary.web.home.contributionsUnavailable}
                username={username}
              />
            </div>
          </div>
        ) : null}
        {hero?.sticker?.asset ? (
          <div
            className={cn(
              layout.sticker,
              collagePhotos.length > 0 && layout.stickerWithCollage,
              "-rotate-[6deg] transition-transform duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:scale-150"
            )}
          >
            <SanityImage
              className="object-contain"
              fill
              image={hero.sticker}
              sizes="110px"
            />
          </div>
        ) : null}
        {collagePhotos.length ? (
          <div className={layout.collage}>
            <PhotoCollage
              caption={contentText(hero?.galleryCaption)}
              photos={collagePhotos}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HeroIdentity({
  hero,
  name,
}: {
  hero: HeroSectionContent;
  name: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className={layout.nameFrame}>
        {hero?.nameGraphic?.paths?.length && hero.nameGraphic.viewBox ? (
          <NameGraphic
            className={cn(layout.nameGraphic, "stroke-4 text-primary")}
            label={stegaClean(name)}
            paths={stegaClean(hero.nameGraphic.paths)}
            viewBox={stegaClean(hero.nameGraphic.viewBox)}
          />
        ) : (
          <span
            className={cn(
              layout.fallbackName,
              "break-words font-bold text-5xl text-primary tracking-tight md:text-7xl"
            )}
          >
            {name}
          </span>
        )}
      </div>
      {contentText(hero?.tagline) ? (
        <p
          className={cn(
            layout.tagline,
            "text-center text-muted-foreground uppercase tracking-[0.2em]"
          )}
        >
          {hero?.tagline}
        </p>
      ) : null}
    </div>
  );
}

function getTracks(hero: HeroSectionContent): Track[] {
  return (hero?.tracks ?? []).flatMap((track) => {
    const src = httpsUrl(track.url);
    const coverImage = track.cover?.asset
      ? urlFor(track.cover).fit("crop").auto("format").quality(75)
      : undefined;
    const cover = httpsUrl(coverImage?.width(240).height(240).url());
    return src && cover && contentText(track.title) && contentText(track.artist)
      ? [
          {
            title: stegaClean(track.title ?? ""),
            artist: stegaClean(track.artist ?? ""),
            src,
            cover,
            coverSrcSet: [160, 240, 320, 480, 640]
              .map(
                (width) =>
                  `${coverImage?.width(width).height(width).url()} ${width}w`
              )
              .join(", "),
          },
        ]
      : [];
  });
}

async function HeroLanyard({
  badge,
  flipBack,
  placeholderName,
}: {
  badge: NonNullable<HeroSectionContent["badge"]>;
  flipBack: string;
  placeholderName: string;
}) {
  const dictionary = lanyardDictionary(badge, placeholderName, flipBack);
  const portrait = httpsUrl(getImageUrl(badge.portrait, 512, 512));
  // A same-origin optimized image can be used as a WebGL texture even when
  // the asset CDN does not allow this website's origin to fetch textures.
  const avatarUrl = portrait
    ? getImageProps({
        src: portrait,
        alt: stegaClean(badge.portrait?.alt ?? ""),
        width: 512,
        height: 512,
      }).props.src
    : "";
  return (
    <Lanyard
      avatarUrl={avatarUrl}
      dictionary={dictionary}
      fov={LANYARD_HERO_FOV}
      preview={await getLanyardPreview(dictionary, portrait)}
    />
  );
}

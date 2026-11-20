import { siteConfig } from "@repo/config/site";
import { stegaClean } from "@sanity/client/stega";
import type { SETTINGS_QUERY_RESULT } from "../sanity.types";
import { contentText } from "./text";

const GITHUB_PROFILE_URL = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/?$/;

export function httpsUrl(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  try {
    const url = new URL(stegaClean(value));
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}

export function githubUsername(value: string | null | undefined): string {
  const url = httpsUrl(value);
  return GITHUB_PROFILE_URL.exec(url)?.[1] ?? "";
}

export function resolveSiteSettings(document: SETTINGS_QUERY_RESULT) {
  const name = contentText(document?.title) || siteConfig.name;
  return {
    name,
    description: contentText(document?.description),
    author: {
      name: contentText(document?.authorName),
      url: httpsUrl(document?.authorUrl),
    },
    publisher: contentText(document?.publisher),
    twitterHandle: stegaClean(document?.twitterHandle ?? ""),
    social: {
      github: githubUsername(document?.githubUrl)
        ? httpsUrl(document?.githubUrl)
        : "",
      linkedin: httpsUrl(document?.linkedinUrl),
    },
    image: httpsUrl(document?.ogImage?.asset?.url),
  };
}

export type SiteSettings = ReturnType<typeof resolveSiteSettings>;

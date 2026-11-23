import type { ArcjetBotCategory, ArcjetWellKnownBot } from "@arcjet/next";

type BotAllowlist = (ArcjetBotCategory | ArcjetWellKnownBot)[];

export const linkPreviewBots = [
  "CATEGORY:PREVIEW",
  // Arcjet groups these crawlers outside CATEGORY:PREVIEW.
  "SLACK_CRAWLER",
  "LINKEDIN_CRAWLER",
  "VERCEL_CRAWLER",
] satisfies BotAllowlist;

export const publicContentBots = [
  "CATEGORY:SEARCH_ENGINE",
  "CATEGORY:MONITOR",
  ...linkPreviewBots,
  // Public archiving and search crawlers outside CATEGORY:SEARCH_ENGINE.
  "ARCHIVEORG_ARCHIVER",
  "ANTHROPIC_CRAWLER_SEARCH",
  "PERPLEXITY_CRAWLER",
] satisfies BotAllowlist;

export const filesApiBots = ["CATEGORY:PREVIEW"] satisfies BotAllowlist;

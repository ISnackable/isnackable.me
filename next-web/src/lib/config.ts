import type { BooleanString, Mapping } from "@giscus/react";
import { getSiteConfig /* getEnv */ } from "./getConfigValue";

// general site config
export const title: string = getSiteConfig("title");
export const description: string = getSiteConfig(
  "description",
  "Personal Site"
);
export const siteUrl: string = getSiteConfig("siteUrl");
export const image: string = getSiteConfig("image");

// social accounts
export const socialUsername: string | null = getSiteConfig(
  "socialUsername",
  null
);

// Notion
// export const rootNotionPageId: string = parsePageId(
//   getSiteConfig("rootNotionPageId"),
//   { uuid: false }
// );

// if (!rootNotionPageId) {
//   throw new Error('Config error invalid "rootNotionPageId"');
// }

// // if you want to restrict pages to a single notion workspace (optional)
// export const rootNotionSpaceId: string | null = parsePageId(
//   getSiteConfig("rootNotionSpaceId", null),
//   { uuid: true }
// );

// Optional Giscus.app comments via GitHub discussions
export const giscusRepo: `${string}/${string}` | null = getSiteConfig(
  "repo",
  null
);
export const giscusRepoId: string | null = getSiteConfig("repoId", null);
export const giscusCategory: string = getSiteConfig(
  "category",
  "Announcements"
);
export const giscusCategoryId: string | null = getSiteConfig(
  "categoryId",
  null
);
export const giscusMapping: Mapping = getSiteConfig("mapping", "pathname");
export const giscusReactionsEnabled: BooleanString = getSiteConfig(
  "reactionsEnabled",
  "1"
);
export const giscusEmitMetadata: BooleanString = getSiteConfig(
  "emitMetadata",
  "0"
);

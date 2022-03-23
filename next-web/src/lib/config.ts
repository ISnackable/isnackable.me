/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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

// Public directory listing
export const directoryUrl: string = getSiteConfig("directoryUrl");

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

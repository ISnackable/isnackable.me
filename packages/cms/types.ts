import type {
  BLOG_INDEX_QUERY_RESULT,
  PROJECTS_META_QUERY_RESULT,
} from "./sanity.types";

export type PostMeta = BLOG_INDEX_QUERY_RESULT["posts"][number];
export type ProjectMeta = PROJECTS_META_QUERY_RESULT[number];

export interface SitemapEntry {
  _updatedAt?: string | null;
  href: string;
}

/** Public query imports. Implementations live beside their content-domain peers. */

export {
  BLOG_INDEX_QUERY,
  LATEST_POSTS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
} from "./queries/blog";
export {
  LEGAL_PAGE_QUERY,
  LEGAL_PAGE_SLUGS_QUERY,
  LEGAL_PAGES_META_QUERY,
} from "./queries/legal";
export { PAGE_QUERY } from "./queries/pages";
export {
  PROJECT_QUERY,
  PROJECT_SLUGS_QUERY,
  PROJECTS_META_QUERY,
} from "./queries/projects";
export { RESUME_LANGUAGES_QUERY, RESUME_QUERY } from "./queries/resume";
export { SETTINGS_QUERY } from "./queries/settings";
export { SITEMAP_QUERY } from "./queries/sitemap";

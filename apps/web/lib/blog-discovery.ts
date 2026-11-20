import type { BlogFilters } from "@repo/cms/data/blog";

const pagePattern = /^\d{1,5}$/;

type SearchParams = Record<string, string | string[] | undefined>;

/** Bound query size and offsets before they enter the shared query cache. */
export function parseBlogFilters(params: SearchParams): BlogFilters {
  const scalar = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) ?? "";
  const rawPage = scalar(params.page);
  const page = pagePattern.test(rawPage) ? Number(rawPage) : 1;
  return {
    page: Math.max(1, Math.min(page, 10_000)),
    q: scalar(params.q).trim().replace(/\s+/g, " ").slice(0, 100),
    tag: scalar(params.tag).trim().slice(0, 100),
  };
}

export function blogHref(locale: string, filters: BlogFilters) {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.tag) {
    params.set("tag", filters.tag);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }
  const query = params.toString();
  return `/${locale}/blog${query ? `?${query}` : ""}`;
}

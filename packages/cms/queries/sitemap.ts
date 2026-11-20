import { defineQuery } from "next-sanity";

export const SITEMAP_QUERY = defineQuery(`
  {
    "pages": *[_type == "page"] | order(_createdAt asc, _id asc){
      route,
      language,
      _updatedAt,
      "noIndex": seo.noIndex == true
    },
    "posts": *[_type == "post" && defined(slug.current) && seo.noIndex != true]{
      "slug": slug.current,
      language,
      _updatedAt
    },
    "projects": *[_type == "project" && defined(slug.current) && seo.noIndex != true]{
      "slug": slug.current,
      language,
      _updatedAt
    },
    "legalPages": *[_type == "legalPage" && defined(slug.current) && seo.noIndex != true]{
      "slug": slug.current,
      _updatedAt
    }
  }
`);

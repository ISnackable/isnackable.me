import { defineQuery } from "next-sanity";
import { contentFragment } from "./content";
import { seoFragment } from "./fragments";

export const LEGAL_PAGES_META_QUERY = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)] | order(_createdAt asc){
    _id,
    "slug": slug.current,
    title,
    description
  }
`);

export const LEGAL_PAGE_QUERY = defineQuery(`
  *[_type == "legalPage" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    description,
    ${contentFragment},
    ${seoFragment}
  }
`);

export const LEGAL_PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)]{
    "slug": slug.current
  }["slug"]
`);

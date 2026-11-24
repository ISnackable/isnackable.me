import { defineQuery } from "next-sanity";
import { contentFragment } from "./content";
import { seoFragment, translationFragment } from "./fragments";

const legalLocaleFilter = `_type == "legalPage" && coalesce(language, $defaultLocale) == $locale`;

export const LEGAL_PAGES_META_QUERY = defineQuery(`
  *[${legalLocaleFilter} && defined(slug.current)] | order(_createdAt asc, _id asc){
    _id,
    "slug": slug.current,
    title,
    description
  }
`);

export const LEGAL_PAGE_QUERY = defineQuery(`
  *[${legalLocaleFilter} && slug.current == $slug] | order(_createdAt asc, _id asc)[0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    description,
    ${contentFragment},
    ${translationFragment},
    ${seoFragment}
  }
`);

export const LEGAL_PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`);

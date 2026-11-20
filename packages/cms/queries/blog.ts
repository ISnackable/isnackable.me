import { defineQuery } from "next-sanity";
import { articleTextProjection } from "../modules/query";
import { contentFragment } from "./content";
import {
  authorFragment,
  imageFragment,
  seoFragment,
  translationFragment,
} from "./fragments";

const publicPostFilter = `_type == "post" && language == $locale && defined(slug.current) && seo.noIndex != true`;

const discoveredPostFilter = `${publicPostFilter}
  && ($topic == "" || $topic in tags)
  && (count($search) == 0 || [title, description, array::join(tags, " "), ${articleTextProjection}] match $search)`;

const postCardProjection = `
  _id, "slug": slug.current, title, description, date,
  image { ${imageFragment} },
  authors[]->{ ${authorFragment} },
  tags,
  "estimatedReadingTime": round(length(${articleTextProjection}) / 5 / 180)
`;

export const BLOG_INDEX_QUERY = defineQuery(`{
  "total": count(*[${discoveredPostFilter}]),
  "tags": array::unique(*[${publicPostFilter}].tags[]) | order(@ asc),
  "posts": *[${discoveredPostFilter}] | order(date desc, _id asc)[$start...$end]{
    ${postCardProjection}
  }
}`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && language == $locale && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    description,
    date,
    image {
      ${imageFragment}
    },
    authors[]->{
      ${authorFragment}
    },
    tags,
    "commentsEnabled": commentsEnabled != false,
    ${contentFragment},
    ${translationFragment},
    ${seoFragment}
  }
`);

export const LATEST_POSTS_QUERY = defineQuery(`
  *[_type == "post" && language == $locale && defined(slug.current) && seo.noIndex != true] | order(date desc)[0...$limit]{
    ${postCardProjection}
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`);

/** Treat query text as prefix-search words; never allow user wildcard patterns. */
export function blogSearchTerms(q: string): string[] {
  return q.match(/[\p{L}\p{N}_-]+/gu)?.map((word) => `${word}*`) ?? [];
}

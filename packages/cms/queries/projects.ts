import { defineQuery } from "next-sanity";
import { contentFragment } from "./content";
import { imageFragment, seoFragment, translationFragment } from "./fragments";

export const PROJECTS_META_QUERY = defineQuery(`
  *[_type == "project" && language == $locale && defined(slug.current) && seo.noIndex != true] | order(coalesce(featured, false) desc, date desc, _id asc)[0...$limit]{
    _id,
    "slug": slug.current,
    title,
    summary,
    role,
    organization,
    technologies,
    date,
    "featured": coalesce(featured, false),
    coverImage {
      ${imageFragment}
    }
  }
`);

export const PROJECT_QUERY = defineQuery(`
  *[_type == "project" && language == $locale && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    summary,
    role,
    organization,
    technologies,
    status,
    startDate,
    endDate,
    repositoryUrl,
    liveUrl,
    date,
    coverImage {
      ${imageFragment}
    },
    ${contentFragment},
    ${translationFragment},
    ${seoFragment}
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`);

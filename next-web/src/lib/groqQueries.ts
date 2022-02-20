import { groq } from "next-sanity";

const isProduction = process.env.NODE_ENV === "production";
const filterDrafts = isProduction ? "&& !(_id in path('drafts.**'))" : "";

export const indexPagePosts = groq`
*[_type == "post" ${filterDrafts}]{
  _id,
  publishedAt,
  mainImage,
  title,
  "slug": slug.current,
  description
}|order(publishedAt desc)[0...4]`;

export const getAllPosts = groq`
*[_type == "post" ${filterDrafts}]{
    _id,
    publishedAt,
    mainImage,
    title,
    "slug": slug.current,
    description,
    categories[]->{title},
}|order(publishedAt desc)`;

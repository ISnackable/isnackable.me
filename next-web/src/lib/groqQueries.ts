import { groq } from "next-sanity";

const isProduction = process.env.NODE_ENV === "production";
const filterDrafts = isProduction ? "&& !(_id in path('drafts.**'))" : "";

export const getAllPostsQuery = groq`
*[_type == "post" ${filterDrafts}]{
    _id,
    publishedAt,
    mainImage{
        ...,
        "lqip": asset->metadata.lqip
    },
    title,
    "slug": slug.current,
    description,
    categories[]->{title},
}|order(publishedAt desc)`;

export const getSinglePostQuery = groq`
*[_type == "post" && slug.current == $slug ${filterDrafts}]{
    _id,
    publishedAt,
    mainImage{
        ...,
        "lqip": asset->metadata.lqip
    },
    title,
    description,
    author->{
        _id,
        name,
        mainImage{
            ...,
            "lqip": asset->metadata.lqip
        },
    },
    categories[]->{title},
    body[]{
        ...,
        markDefs[]{
            ...,
            _type == "internalLink" => {
              "slug": @.reference->slug
            }
          }
    },
}`;

export const getAllCategoriesQuery = groq`
*[_type == "category" ${filterDrafts}]{
    _id,
    _type,
    title,
    description
}
`;

export const getAllProjectQuery = groq`
*[_type == "project" ${filterDrafts}]{
    _id,
    mainImage{
        ...,
        "lqip": asset->metadata.lqip
    },
    title,
    description,
    projectUrl,
}|order(publishedAt desc)`;

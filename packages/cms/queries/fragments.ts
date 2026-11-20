/** Shared explicit projections. Keep editor-only fields out of public reads. */
export const imageFragment = `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions { width, height }
    }
  },
  alt
`;

export const authorFragment = `
  _id,
  name,
  "slug": slug.current,
  avatar {
    ${imageFragment}
  },
  xUrl
`;

export const seoFragment = `
  "seo": {
    "title": coalesce(seo.title, title, ""),
    "description": coalesce(seo.description, description, summary, ""),
    "image": seo.image {
      ${imageFragment}
    },
    "noIndex": seo.noIndex == true
  }
`;

export const translationFragment = `
  "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    _type,
    language,
    "slug": slug.current,
    "noIndex": seo.noIndex == true
  }
`;

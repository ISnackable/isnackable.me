import ComputedField from "sanity-plugin-computed-field";

export default {
  name: "mainImage",
  type: "image",
  title: "Image",
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: "caption",
      type: "string",
      title: "Caption",
      inputComponent: ComputedField,
      options: {
        isHighlighted: true,
        editable: true,
        documentQuerySelection: `
        _id,
        mainImage {
          asset-> {
            altText,
            description,
          }
        }`,
        reduceQueryResult: (queryResult) => {
          if (queryResult.mainImage.asset?.description) {
            return queryResult.mainImage.asset?.description;
          }
          return "Default Caption";
        },
      },
    },
    {
      name: "alt",
      type: "string",
      title: "Alternative text",
      description: "Important for SEO and accessibility.",
      validation: (Rule) =>
        Rule.error("You have to fill out the alternative text.").required(),
      inputComponent: ComputedField,
      options: {
        isHighlighted: true,
        editable: true,
        documentQuerySelection: `
        mainImage {
          asset-> {
            altText,
            description,
          }
        }`,
        reduceQueryResult: (queryResult) => {
          if (queryResult.mainImage.asset?.altText) {
            return queryResult.mainImage.asset?.altText;
          }
          return "Default AltText";
        },
      },
    },
  ],
  preview: {
    select: {
      imageUrl: "asset.url",
      title: "caption",
    },
  },
};

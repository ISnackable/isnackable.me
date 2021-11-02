import ExternalImagePreview from "../previews/externalImage";

export default {
  type: "object",
  name: "externalImage",
  title: "External Image",
  fields: [
    {
      name: "url",
      type: "url",
      description: "Visit an raw image link in a browser and copy the URL.",
    },
    {
      title: "Alt Text",
      name: "alt",
      type: "string",
    },
    {
      title: "Caption",
      name: "caption",
      type: "string",
    },
  ],
  preview: {
    select: { url: "url" },
    component: ExternalImagePreview,
  },
};

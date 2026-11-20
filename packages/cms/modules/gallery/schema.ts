import { ImagesIcon } from "@sanity/icons/Images";
import { defineArrayMember, defineField } from "sanity";
import { imageAltField } from "../../schemas/shared/editorial";
import { defineModule } from "../define-module";

export const galleryModule = defineModule({
  name: "galleryModule",
  title: "Image gallery",
  type: "object",
  icon: ImagesIcon,
  fields: [
    defineField({ name: "title", title: "Heading", type: "string" }),
    defineField({
      name: "columns",
      type: "number",
      initialValue: 2,
      options: { list: [1, 2, 3] },
    }),
    defineField({
      name: "images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { collapsible: false, hotspot: true },
          fields: [
            imageAltField,
            defineField({ name: "caption", type: "string" }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1).max(18),
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { title: "title", media: "images.0", images: "images" },
    prepare: ({ title, media, images }) => ({
      title: title || "Image gallery",
      subtitle: `${images?.length ?? 0} images`,
      media,
    }),
  },
});

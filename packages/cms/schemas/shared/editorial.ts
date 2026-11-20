import {
  ALL_FIELDS_GROUP,
  type ArrayOptions,
  defineField,
  type ObjectOptions,
} from "sanity";

/** Keep the initial form focused; Studio still reveals deep-linked fields. */
export const hiddenAllFieldsGroup = { ...ALL_FIELDS_GROUP, hidden: true };

export const sectionEditorOptions: ObjectOptions = {
  collapsible: false,
  modal: { type: "dialog", width: 3 },
};

/** Long collections stay compact, with the remaining entries one click away. */
export const collectionEditorOptions: ArrayOptions = {
  layout: "list",
  modal: { type: "dialog", width: 2 },
  collapseItemsAfter: 4,
};

export const imageAltField = defineField({
  name: "alt",
  title: "Alternative text",
  type: "string",
  description: "Describe what the image conveys for someone who cannot see it.",
  validation: (rule) => rule.required(),
});

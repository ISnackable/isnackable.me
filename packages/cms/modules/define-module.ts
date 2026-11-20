import { defineField, defineType, type ObjectDefinition } from "sanity";

/** Standard Sanity object schema plus shared placement controls; stored type names stay unchanged. */
export function defineModule(definition: ObjectDefinition) {
  const hasGroups = Boolean(definition.groups?.length);
  return defineType({
    ...definition,
    options: definition.options ?? { collapsible: false },
    groups: [
      ...(definition.groups ?? [
        { name: "content", title: "Content", default: true },
      ]),
      { name: "display", title: "Display" },
    ],
    fields: [
      ...definition.fields.map((field) => ({
        ...field,
        group: field.group ?? (hasGroups ? undefined : "content"),
      })),
      defineField({
        name: "attributes",
        title: "Visibility & links",
        type: "moduleAttributes",
        group: "display",
      }),
    ],
  });
}

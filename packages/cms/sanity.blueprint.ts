// sanity.blueprint.ts
import { defineBlueprint, defineDocumentFunction } from "@sanity/blueprints";

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: "auto-tag",
      src: "./functions/auto-tag",
      memory: 2,
      timeout: 30,
      event: {
        on: ["create", "update"],
        filter:
          "_type in ['post', 'project'] && (delta::changedAny((title, description, summary, content)) || (delta::operation() == 'create' && (defined(title) || defined(description) || defined(summary) || defined(content))))",
        projection: "{_id, _rev, _type}",
      },
    }),
  ],
});

import { createClient } from "@sanity/client";
import { documentEventHandler } from "@sanity/functions";

interface TagEvent {
  _id: string;
  _rev?: string;
}

interface TaggedDocument {
  _id: string;
  _rev: string;
  _type: string;
  tags?: unknown;
  technologies?: unknown;
}

function uniqueTags(value: unknown, lowercase = false): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  return value.flatMap((tag) => {
    if (typeof tag !== "string") {
      return [];
    }
    const trimmed = tag.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) {
      return [];
    }
    seen.add(key);
    return [lowercase ? key : trimmed];
  });
}

export const handler = documentEventHandler<TagEvent>(
  async ({ context, event: { data } }) => {
    // Never publish or tag a draft/release version, including in local tests.
    if (data._id.startsWith("drafts.") || data._id.startsWith("versions.")) {
      return;
    }
    const client = createClient({
      ...context.clientOptions,
      apiVersion: "vX",
      useCdn: false,
      perspective: "raw",
    });
    const document = await client.getDocument<TaggedDocument>(data._id);
    if (!(document && ["post", "project"].includes(document._type))) {
      return;
    }
    // Ignore repeated deliveries and content superseded by a newer edit.
    if (data._rev && data._rev !== document._rev) {
      return;
    }

    const isProject = document._type === "project";
    const field = isProject ? "technologies" : "tags";
    const existing = uniqueTags(document[field]);
    const result = await client.agent.action.generate({
      noWrite: true,
      instructionParams: {
        title: { type: "field", path: "title" },
        summary: {
          type: "field",
          path: isProject ? "summary" : "description",
        },
        content: { type: "field", path: "content" },
        currentLabels: { type: "constant", value: JSON.stringify(existing) },
        vocabulary: {
          type: "groq",
          query: `array::unique(*[_type == $type && _id != $id && !(_id in path('drafts.**')) && !(_id in path('versions.**'))].${field}[])`,
          params: { id: document._id, type: document._type },
        },
      },
      instruction: isProject
        ? "Identify up to 3 technologies explicitly mentioned in $title, $summary and $content. Include only named programming languages, frameworks, libraries, platforms or tools. Reuse $currentLabels and $vocabulary only when supported by the project text. Preserve official names and casing. Do not return general topics, roles or techniques, and do not guess technologies. Return an empty array if none are mentioned."
        : "Choose up to 3 relevant topic tags for $title, $summary and $content. Reuse $currentLabels and $vocabulary when relevant. Return distinct, simple lowercase strings without brackets or surrounding whitespace. Do not return alternate casing of the same tag.",
      // Generate defaults to appending arrays. Replace the dry-run value instead.
      target: { path: field, operation: "set" },
      documentId: document._id,
      schemaId: "_.schemas.default",
      forcePublishedWrite: true,
    });
    const suggestions = result[field];
    const generated = uniqueTags(suggestions, !isProject).slice(0, 3);
    if (
      !Array.isArray(suggestions) ||
      (suggestions.length && !generated.length)
    ) {
      throw new Error("Tag generation returned no valid tags.");
    }
    // Retain curated spelling. Only blog suggestions are lowercased.
    const tags = uniqueTags([...existing, ...generated]);
    const previousTags = document[field];
    if (
      !tags.length ||
      (Array.isArray(previousTags) &&
        tags.length === previousTags.length &&
        tags.every((tag, index) => tag === previousTags[index]))
    ) {
      return;
    }
    if (context.local) {
      console.log("Auto-tag preview (no writes):", tags);
      return;
    }

    try {
      await client
        .patch(document._id)
        .ifRevisionId(document._rev)
        .set({ [field]: tags })
        .commit({ returnDocuments: false });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 409
      ) {
        console.log("Skipped auto-tagging after a concurrent edit.");
        return;
      }
      throw error;
    }
  }
);

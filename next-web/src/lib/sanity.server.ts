/**
 * Server-side Sanity utilities. By having these in a separate file from the
 * utilities we use on the client side, we are able to tree-shake (remove)
 * code that is not used on the client side.
 */
import { createClient } from "next-sanity";
import {
  getAllPostsQuery,
  getAllCategoriesQuery,
  getAllProjectQuery
} from "./groqQueries";
import type {
  GenericSanityDocument,
  AllSanityPost,
  AllSanityCategory,
  AllSanityProject
} from "../@types/sanity";

export const sanityConfig = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  apiVersion: "2021-10-21", // Learn more: https://www.sanity.io/docs/api-versioning
  /**
   * Set useCdn to `false` if your application require the freshest possible
   * data always (potentially slightly slower and a bit more expensive).
   * Authenticated request (like preview) will always bypass the CDN
   **/
  useCdn: process.env.NODE_ENV === "production"
};

export const sanityClient = createClient(sanityConfig);

// Set up a preview client with serverless authentication for drafts
export const previewClient = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Helper function for easily switching between normal client and preview client
export const getClient = (usePreview?: boolean) =>
  usePreview ? previewClient : sanityClient;

export function overlayDrafts<T extends GenericSanityDocument>(docs: T[]): T[] {
  const documents = docs || [];
  const overlayed: Map<string, T> = documents.reduce((map, doc) => {
    if (!doc._id) {
      throw new Error("Ensure that `_id` is included in query projection");
    }

    const isDraft = doc._id.startsWith("drafts.");
    const id = isDraft ? doc._id.slice(7) : doc._id;
    return isDraft || !map.has(id) ? map.set(id, doc) : map;
  }, new Map());

  return Array.from(overlayed.values());
}

export async function getAllPosts(preview?: boolean): Promise<AllSanityPost[]> {
  const data: AllSanityPost[] = overlayDrafts(
    await getClient(preview).fetch(getAllPostsQuery)
  );

  return data;
}

export async function getAllCategories(
  preview?: boolean
): Promise<AllSanityCategory[]> {
  const data: AllSanityCategory[] = overlayDrafts(
    await getClient(preview).fetch(getAllCategoriesQuery)
  );

  return data;
}

export async function getAllProjects(
  preview?: boolean
): Promise<AllSanityProject[]> {
  const data: AllSanityProject[] = await getClient(preview).fetch(
    getAllProjectQuery
  );

  return data;
}

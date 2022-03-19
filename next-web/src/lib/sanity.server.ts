/**
 * Server-side Sanity utilities. By having these in a separate file from the
 * utilities we use on the client side, we are able to tree-shake (remove)
 * code that is not used on the client side.
 */
import { createClient } from "next-sanity";
import {
  getAllPostsQuery,
  getSinglePostQuery,
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
  useCdn: process.env.NODE_ENV !== "production"
  // useCdn == true gives fast, cheap responses using a globally distributed cache.
  // When in production the Sanity API is only queried on build-time, and on-demand when responding to webhooks.
  // Thus the data need to be fresh and API response time is less important.
  // When in development/working locally, it's more important to keep costs down as hot reloading can incurs a lot of API calls
  // And every page load calls getStaticProps.
  // To get the lowest latency, lowest cost, and latest data, use the Instant Preview mode
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

export function filterDataToSingleItem<T extends GenericSanityDocument>(
  data: T[],
  preview?: boolean
): T {
  if (!Array.isArray(data)) {
    return data;
  }

  if (data.length === 1) {
    return data[0];
  }

  if (preview) {
    return data.find((item) => item._id.startsWith(`drafts.`)) || data[0];
  }

  return data[0];
}

export async function getAllPosts(preview?: boolean): Promise<AllSanityPost[]> {
  const data: AllSanityPost[] = overlayDrafts(
    await getClient(preview).fetch(getAllPostsQuery)
  );

  return data;
}

export async function getSinglePost(preview = false, slug: string) {
  const queryParams = { slug: slug };
  const data: AllSanityPost[] = overlayDrafts(
    await getClient(preview).fetch(getSinglePostQuery, queryParams)
  );

  return { post: data, query: getSinglePostQuery, queryParams };
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

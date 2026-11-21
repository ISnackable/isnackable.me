import "server-only";
import { keys } from "./keys";

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET } = keys();

/**
 * Dated API version — Sanity locks query behavior to the version date.
 * Bump this when adopting new GROQ features; see
 * https://www.sanity.io/docs/api-versioning
 */
export const apiVersion = "2026-06-21";

export const projectId = NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = NEXT_PUBLIC_SANITY_DATASET;

/** Studio is served at `/studio` on the portfolio origin. */
export const studioUrl = "/studio";

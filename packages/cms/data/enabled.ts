import "server-only";
import { keys } from "../keys";

/** Unconfigured datasets preserve the optional CMS behavior. */
export const enabled = Boolean(keys().NEXT_PUBLIC_SANITY_PROJECT_ID);

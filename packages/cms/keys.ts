import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      // Read-only Viewer token; shared with authenticated draft-preview browsers.
      // Optional: if unset, the client falls back to the public CDN read path.
      SANITY_API_READ_TOKEN: z.string().or(z.literal("")).optional(),
      SANITY_REVALIDATE_SECRET: z.string().or(z.literal("")).optional(),
    },
    client: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    },
    runtimeEnv: {
      SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
      SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    },
  });

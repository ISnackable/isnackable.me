import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** Optional provider configuration, composed by the consuming app. */
export const keys = () =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      GISCUS_REPO: z.string().optional(),
      GISCUS_REPO_ID: z.string().optional(),
      GISCUS_CATEGORY: z.string().optional(),
      GISCUS_CATEGORY_ID: z.string().optional(),
    },
    runtimeEnv: {
      GISCUS_REPO: process.env.GISCUS_REPO,
      GISCUS_REPO_ID: process.env.GISCUS_REPO_ID,
      GISCUS_CATEGORY: process.env.GISCUS_CATEGORY,
      GISCUS_CATEGORY_ID: process.env.GISCUS_CATEGORY_ID,
    },
  });

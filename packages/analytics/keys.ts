import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    client: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z
        .string()
        .startsWith("G-")
        .or(z.literal(""))
        .optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    },
  });

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const https = /^https$/;

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      KV_REST_API_URL: z.url({ protocol: https }).optional(),
      KV_REST_API_TOKEN: z.string().min(1).optional(),
    },
    runtimeEnv: {
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    },
  });

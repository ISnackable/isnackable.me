import { keys as cms } from "@repo/cms/keys";
import { keys as comments } from "@repo/comments/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as security } from "@repo/security/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [comments(), cms(), core(), observability(), security()],
  server: {
    FILES_BROWSER_TEST_ORIGIN: z.url().optional(),
  },
  client: {},
  runtimeEnv: {
    FILES_BROWSER_TEST_ORIGIN: process.env.FILES_BROWSER_TEST_ORIGIN,
  },
});

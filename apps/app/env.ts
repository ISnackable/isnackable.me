import { keys as core } from "@repo/next-config/keys";
import { keys as security } from "@repo/security/keys";
import { keys as storage } from "@repo/storage/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [core(), security(), storage()],
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  server: {
    FILES_BASE_DIRECTORY: z.string().min(1).optional(),
    FILES_CLIENT_ID: z.uuid().optional(),
    FILES_CLIENT_SECRET: z.string().min(1).optional(),
    FILES_TENANT_ID: z.uuid().optional(),
    FILES_CONTENT_HOSTS: z.string().min(1).optional(),
    FILES_SIGNING_SECRET: z.string().min(32).optional(),
    FILES_PROTECTED_FOLDERS: z.string().min(1).optional(),
  },
  client: {},
  runtimeEnv: {
    FILES_BASE_DIRECTORY: process.env.FILES_BASE_DIRECTORY,
    FILES_CLIENT_ID: process.env.FILES_CLIENT_ID,
    FILES_CLIENT_SECRET: process.env.FILES_CLIENT_SECRET,
    FILES_TENANT_ID: process.env.FILES_TENANT_ID,
    FILES_CONTENT_HOSTS: process.env.FILES_CONTENT_HOSTS,
    FILES_SIGNING_SECRET: process.env.FILES_SIGNING_SECRET,
    FILES_PROTECTED_FOLDERS: process.env.FILES_PROTECTED_FOLDERS,
  },
});

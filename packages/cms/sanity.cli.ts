import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  typegen: {
    path: ["./**/*.{ts,tsx}", "../../apps/web/app/**/*.{ts,tsx}"],
    generates: "./sanity.types.ts",
  },
});

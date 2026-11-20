import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig(config, {
  testIgnore: [],
  projects: config.projects?.map((project) => ({ ...project, testIgnore: [] })),
  testMatch: "**/instant.spec.ts",
});

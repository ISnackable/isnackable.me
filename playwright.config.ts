import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testIgnore: "**/instant.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      testIgnore: ["**/pdf.spec.ts", "**/instant.spec.ts"],
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter studio preview --host 127.0.0.1",
      url: "http://127.0.0.1:3333/studio",
      reuseExistingServer: false,
    },
    {
      command:
        "pnpm --filter app exec node --import ../../tests/fixtures/files-services.mjs ./node_modules/next/dist/bin/next start -p 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      env: {
        SKIP_ENV_VALIDATION: "true",
        ARCJET_KEY: "",
        ARCJET_ENV: "development",
      },
    },
    {
      command: "pnpm --filter web exec next start -p 3101",
      url: "http://127.0.0.1:3101/en",
      reuseExistingServer: false,
      env: {
        SKIP_ENV_VALIDATION: "true",
        ARCJET_KEY: "",
        ARCJET_ENV: "development",
      },
    },
  ],
});

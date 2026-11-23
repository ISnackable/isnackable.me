import { defineConfig, devices } from "@playwright/test";
import {
  filesOrigin,
  filesPort,
  hostname,
  webOrigin,
  webPort,
} from "./tests/fixtures/browser-servers.mjs";

export default defineConfig({
  testDir: "./tests/browser",
  testIgnore: "**/instant.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: webOrigin,
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
      command: `pnpm --filter app exec node --import ../../tests/fixtures/files-services.mjs ./node_modules/next/dist/bin/next start -H ${hostname} -p ${filesPort}`,
      url: filesOrigin,
      reuseExistingServer: false,
      env: {
        SKIP_ENV_VALIDATION: "false",
        NEXT_PUBLIC_WEB_URL: webOrigin,
        ARCJET_KEY: "",
        ARCJET_ENV: "development",
      },
    },
    {
      command: `pnpm --filter web exec next start -H ${hostname} -p ${webPort}`,
      url: `${webOrigin}/en`,
      reuseExistingServer: false,
      env: {
        SKIP_ENV_VALIDATION: "true",
        NEXT_PUBLIC_WEB_URL: webOrigin,
        ARCJET_KEY: "",
        ARCJET_ENV: "development",
      },
    },
  ],
});

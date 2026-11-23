import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const hostname = "127.0.0.1";
export const filesPort = 3100;
export const webPort = 3101;
export const filesOrigin = `http://${hostname}:${filesPort}`;
export const webOrigin = `http://${hostname}:${webPort}`;

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  const build = spawnSync("pnpm", ["build"], {
    env: {
      ...process.env,
      FILES_BROWSER_TEST_ORIGIN: filesOrigin,
      NEXT_PUBLIC_WEB_URL: webOrigin,
    },
    stdio: "inherit",
  });
  if (build.error) {
    throw build.error;
  }
  process.exitCode = build.status ?? 1;
}

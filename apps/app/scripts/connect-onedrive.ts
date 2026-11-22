import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { CryptoProvider } from "@azure/msal-node";
import { getRedis } from "@repo/storage/redis";
import {
  driveItemPath,
  getFileDownloadUrl,
  isPublishedFile,
  type PublishedEntry,
  resolveEntry,
  sameOneDrivePath,
} from "@/lib/files/access";
import { saveDriveConnection } from "@/lib/files/connection";
import {
  fetchGraphContent,
  type GraphDrive,
  getOwnerDrive,
  getOwnerFolder,
  parseContentUrl,
} from "@/lib/files/graph";
import { createMicrosoftClient, filesReadScope } from "@/lib/files/microsoft";
import { readFilePath } from "@/lib/files/paths";
import { getSettings } from "@/lib/files/settings";

const callback = new URL("http://localhost:8765/onedrive/callback");
const credentialEnvironment = /^(?:FILES_|UPSTASH_|ARCJET_)/i;
const callbackHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "text/plain; charset=utf-8",
  "Referrer-Policy": "no-referrer",
};

class SetupError extends Error {}

function openSignIn(url: string) {
  console.info(
    `Sign in with the Microsoft account that owns the folder.\n${url}\n`
  );
  const [command, ...args] =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["rundll32.exe", "url.dll,FileProtocolHandler", url]
        : ["xdg-open", url];
  const launcherEnv = { ...process.env };
  for (const name of Object.keys(launcherEnv)) {
    if (credentialEnvironment.test(name)) {
      delete launcherEnv[name];
    }
  }
  const browser = spawn(command, args, { env: launcherEnv, stdio: "ignore" });
  browser.on("error", () => {
    // The printed URL also works on hosts that cannot launch a browser.
  });
  browser.unref();
}

async function waitForAuthorization(authorize: string, state: string) {
  const server = createServer();
  const authorization = new Promise<string | null>((resolve) => {
    AbortSignal.timeout(300_000).addEventListener(
      "abort",
      () => resolve(null),
      { once: true }
    );
    server.on("request", (request, response) => {
      const [path, query] = (request.url ?? "").split("?");
      const parameters = new URLSearchParams(query);
      if (
        request.method !== "GET" ||
        request.headers.host !== callback.host ||
        path !== callback.pathname ||
        parameters.get("state") !== state
      ) {
        response
          .writeHead(400, callbackHeaders)
          .end("Invalid sign-in callback.");
        return;
      }
      const code = parameters.get("code");
      response
        .writeHead(code ? 200 : 400, callbackHeaders)
        .end(
          code
            ? "Sign-in received. Return to the terminal to finish setup."
            : "Sign-in was cancelled. Return to the terminal."
        );
      resolve(code);
    });
  });

  try {
    server.listen(Number(callback.port), "127.0.0.1");
    await once(server, "listening");
    openSignIn(authorize);
    const code = await authorization;
    if (!code) {
      throw new SetupError(
        "Sign-in was cancelled or timed out. Run the command again."
      );
    }
    return code;
  } finally {
    server.close();
  }
}

async function connect() {
  const samplePath = readFilePath(process.argv[2] ?? null);
  if (!samplePath?.length) {
    throw new SetupError(
      'Usage: pnpm --filter app connect:onedrive "sample.txt"'
    );
  }

  const redis = getRedis();
  if (!redis) {
    throw new SetupError(
      "Add your Upstash REST URL and read/write token to apps/app/.env.local first."
    );
  }
  const settings = readSetupSettings();
  await redis.ping().catch(() => {
    throw new SetupError(
      "Couldn’t reach Redis. Check your Upstash REST URL and read/write token."
    );
  });

  const client = createMicrosoftClient(settings);
  const owner = await signIn(client);
  const credentials = { accessToken: () => owner.accessToken };
  const drive = await getOwnerDrive(credentials).catch(() => {
    throw new SetupError(
      "Couldn’t read your OneDrive. Check the signed-in account and Files.Read consent."
    );
  });
  if (drive.driveType !== (settings.tenantId ? "business" : "personal")) {
    throw new SetupError(
      "The signed-in OneDrive type doesn’t match FILES_TENANT_ID. Use the organization’s tenant ID for work or school, or leave it empty for personal OneDrive."
    );
  }
  const folder = await getOwnerFolder(
    credentials,
    settings.baseDirectory
  ).catch(() => {
    throw new SetupError(
      "Couldn’t find FILES_BASE_DIRECTORY in your OneDrive."
    );
  });
  const rootPath = driveItemPath(folder, drive.id);
  if (
    !(
      folder.folder &&
      rootPath &&
      sameOneDrivePath(rootPath, settings.baseDirectory)
    )
  ) {
    throw new SetupError("Choose a folder owned by this OneDrive account.");
  }

  const binding = {
    ...credentials,
    driveId: drive.id,
    rootId: folder.id,
    rootPath,
  };
  const sample = await resolveEntry(binding, samplePath, {
    download: true,
  }).catch(() => {
    throw new SetupError(
      "Couldn’t find the sample file. Use its path from FILES_BASE_DIRECTORY."
    );
  });
  const contentHost = await verifySample(
    binding,
    sample,
    settings.contentHosts
  );
  await saveDriveConnection({
    accountId: owner.accountId,
    connectionId: randomUUID(),
    contentHost,
    driveId: binding.driveId,
    rootId: binding.rootId,
    rootPath,
    tokenCache: client.getTokenCache().serialize(),
  }).catch(() => {
    throw new SetupError(
      "Couldn’t save the OneDrive connection to Redis. Check that the Upstash token has read and write access."
    );
  });
  console.info(
    "Connected OneDrive. Open the files app to browse your public folder."
  );
}

function readSetupSettings() {
  try {
    return getSettings();
  } catch {
    // biome-ignore lint/style/useErrorCause: Keep environment values and former folder protection hashes out of setup errors.
    throw new SetupError(
      "Set FILES_BASE_DIRECTORY, the Entra client credentials, and FILES_SIGNING_SECRET. Move any previously protected folders outside the public tree and clear FILES_PROTECTED_FOLDERS first."
    );
  }
}

async function signIn(client: ReturnType<typeof createMicrosoftClient>) {
  const crypto = new CryptoProvider();
  const state = crypto.createNewGuid();
  const nonce = crypto.createNewGuid();
  const { challenge, verifier } = await crypto.generatePkceCodes();
  const scopes = [filesReadScope];
  const authorize = await client.getAuthCodeUrl({
    codeChallenge: challenge,
    codeChallengeMethod: "S256",
    nonce,
    prompt: "select_account",
    redirectUri: callback.href,
    responseMode: "query",
    scopes,
    state,
  });
  const code = await waitForAuthorization(authorize, state);
  const token = await client
    .acquireTokenByCode({
      code,
      codeVerifier: verifier,
      nonce,
      redirectUri: callback.href,
      scopes,
      state,
    })
    .catch(() => {
      throw new SetupError(
        "Microsoft couldn’t finish sign-in. Check the client secret Value and the Web redirect URI in Entra."
      );
    });
  if (!(token.account?.homeAccountId && token.accessToken)) {
    throw new SetupError(
      "Microsoft didn’t return an authorized account. Check Files.Read consent."
    );
  }
  return {
    accessToken: token.accessToken,
    accountId: token.account.homeAccountId,
  };
}

async function verifySample(
  drive: GraphDrive,
  sample: PublishedEntry,
  extraHosts: ReadonlySet<string>
) {
  if (!isPublishedFile(sample)) {
    throw new SetupError(
      "The sample path points to a folder. Pass a file path relative to FILES_BASE_DIRECTORY, such as sample.txt."
    );
  }
  const downloadUrl = await getFileDownloadUrl(drive, sample).catch(() => {
    throw new SetupError(
      "Microsoft Graph couldn’t open a download for the sample file. Choose a file you can download in OneDrive."
    );
  });
  const location = parseContentUrl(downloadUrl);
  if (!location) {
    throw new SetupError(
      "Microsoft returned an unsupported download hostname for the sample file."
    );
  }
  const response = await fetchGraphContent(
    new Set([location.hostname, ...extraHosts]),
    location.href,
    {
      range: sample.entry.size ? "bytes=0-0" : undefined,
      signal: AbortSignal.timeout(10_000),
    }
  ).catch(() => {
    throw new SetupError(
      "Couldn’t reach the sample download. Check your connection and any additional FILES_CONTENT_HOSTS."
    );
  });
  await response.body?.cancel();
  if (!response.ok) {
    throw new SetupError(
      "Couldn’t download the sample file. Choose a public file and try again."
    );
  }
  return location.hostname;
}

connect().catch((error: unknown) => {
  console.error(
    error instanceof SetupError
      ? error.message
      : "OneDrive setup failed. Check your connection and whether localhost port 8765 is available, then try again."
  );
  process.exitCode = 1;
});

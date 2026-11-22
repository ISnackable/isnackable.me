import "server-only";
import { createHmac } from "node:crypto";
import { InteractionRequiredAuthError, ServerError } from "@azure/msal-node";
import { z } from "zod";
import { openJson, sealJson } from "./crypto";
import { FilesError } from "./errors";
import type { GraphDrive } from "./graph";
import { createMicrosoftClient, filesReadScope } from "./microsoft";
import { isFilePath } from "./paths";
import { requireFilesRedis } from "./redis";
import {
  contentHostname,
  type FilesSettings,
  getSettings,
  oneDriveId,
} from "./settings";

const connectionSchema = z.object({
  accountId: z.string().min(1),
  connectionId: z.uuid(),
  contentHost: contentHostname,
  driveId: oneDriveId,
  rootId: oneDriveId,
  rootPath: z.array(z.string()).min(1).refine(isFilePath),
  tokenCache: z.string().min(1),
});

export type OneDriveConnection = z.infer<typeof connectionSchema>;

export interface PublishedDrive extends GraphDrive {
  readonly connectionId: string;
  readonly contentHosts: ReadonlySet<string>;
}

const replaceConnection = `
if redis.call("GET", KEYS[1]) ~= ARGV[1] then return 0 end
redis.call("SET", KEYS[1], ARGV[2])
return 1
`;

function connectionKeys(settings: FilesSettings) {
  const { tenantId } = settings;
  const scope = JSON.stringify(
    tenantId
      ? [settings.clientId, settings.baseDirectory, tenantId]
      : [settings.clientId, settings.baseDirectory]
  );
  const namespace = tenantId ? "onedrive-work:v1" : "onedrive-personal:v2";
  const hash = (purpose: string) =>
    createHmac("sha256", settings.secret).update(
      `${namespace}:${purpose}:${scope}`
    );

  return {
    encryptionKey: hash("cache").digest(),
    redisKey: `files:${namespace}:${hash("redis").digest("hex")}`,
  };
}

function openConnection(sealed: string, key: Buffer) {
  try {
    return connectionSchema.parse(openJson(sealed, key));
  } catch {
    // biome-ignore lint/style/useErrorCause: A corrupt record may contain credentials.
    throw new FilesError("unconfigured");
  }
}

export async function saveDriveConnection(connection: OneDriveConnection) {
  const { encryptionKey, redisKey } = connectionKeys(getSettings());
  const record = connectionSchema.parse(connection);
  await requireFilesRedis().set(redisKey, sealJson(record, encryptionKey));
}

async function acquireToken(
  settings: FilesSettings,
  record: OneDriveConnection,
  forceRefresh: boolean
) {
  const client = createMicrosoftClient(settings);
  const cache = client.getTokenCache();
  try {
    cache.deserialize(record.tokenCache);
  } catch {
    // biome-ignore lint/style/useErrorCause: Keep the token cache out of error details.
    throw new FilesError("unconfigured");
  }
  const account = await cache.getAccountByHomeId(record.accountId);
  if (!account) {
    throw new FilesError("unconfigured");
  }

  try {
    const result = await client.acquireTokenSilent({
      account,
      forceRefresh,
      scopes: [filesReadScope],
    });
    if (!result.accessToken) {
      throw new FilesError("unconfigured");
    }
    return { token: result.accessToken, tokenCache: cache.serialize() };
  } catch (error) {
    if (
      error instanceof InteractionRequiredAuthError ||
      (error instanceof ServerError && error.errorCode === "invalid_grant")
    ) {
      // biome-ignore lint/style/useErrorCause: Keep Microsoft identity details out of the setup error.
      throw new FilesError("unconfigured");
    }
    throw error;
  }
}

async function acquireConnection(
  settings: FilesSettings,
  expectedConnection?: string,
  rejectedToken?: string
) {
  const redis = requireFilesRedis();
  const { encryptionKey, redisKey } = connectionKeys(settings);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: A conflict requires a fresh read of the winning record.
    const sealed = await redis.get<string>(redisKey);
    if (!sealed) {
      throw new FilesError("unconfigured");
    }
    const record = openConnection(sealed, encryptionKey);
    if (expectedConnection && record.connectionId !== expectedConnection) {
      throw new FilesError("unavailable");
    }

    const { token, tokenCache } = await acquireToken(
      settings,
      record,
      attempt === 0 && rejectedToken !== undefined
    );
    if (tokenCache === record.tokenCache) {
      return { record, token };
    }

    const updated = sealJson({ ...record, tokenCache }, encryptionKey);
    const stored = await redis.eval<[string, string], number>(
      replaceConnection,
      [redisKey],
      [sealed, updated]
    );
    if (stored === 1) {
      return { record, token };
    }
  }
  throw new FilesError("unavailable");
}

export async function openPublishedDrive(): Promise<PublishedDrive> {
  const settings = getSettings();
  const { record, token } = await acquireConnection(settings);
  const { connectionId, contentHost, driveId, rootId, rootPath } = record;
  let accessToken = token;
  let refreshInFlight: Promise<string> | undefined;
  return {
    accessToken: () => accessToken,
    connectionId,
    contentHosts: new Set([contentHost, ...settings.contentHosts]),
    driveId,
    refresh(rejectedToken) {
      if (accessToken !== rejectedToken) {
        return Promise.resolve(accessToken);
      }
      refreshInFlight ??= acquireConnection(
        settings,
        connectionId,
        rejectedToken
      )
        .then(({ token: renewedToken }) => {
          accessToken = renewedToken;
          return renewedToken;
        })
        .finally(() => {
          refreshInFlight = undefined;
        });
      return refreshInFlight;
    },
    rootId,
    rootPath,
  };
}

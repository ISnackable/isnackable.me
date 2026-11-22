// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  type OneDriveConnection,
  openPublishedDrive,
  saveDriveConnection,
} from "@/lib/files/connection";
import {
  fetchGraphContent,
  getGraphItem,
  getOwnerDrive,
} from "@/lib/files/graph";
import {
  accessToken,
  accountId,
  clientId,
  filesTokenCache,
  refreshToken,
} from "../../../tests/fixtures/files-token-cache.mjs";

const { config, redis, records } = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    config: {
      FILES_BASE_DIRECTORY: "Public",
      FILES_CLIENT_ID: "760779e6-ee5d-4149-9c24-d896ca371112",
      FILES_CLIENT_SECRET: "fixture-microsoft-client-secret",
      FILES_PROTECTED_FOLDERS: "{}",
      FILES_SIGNING_SECRET: "fixture-only-signing-secret-000000",
      FILES_TENANT_ID: undefined as string | undefined,
    },
    records: values,
    redis: {
      eval: vi.fn(
        (
          _script: string,
          [key]: [string],
          [previous, replacement]: [string, string]
        ) => {
          if (values.get(key) !== previous) {
            return Promise.resolve(0);
          }
          values.set(key, replacement);
          return Promise.resolve(1);
        }
      ),
      get: vi.fn((key: string) => Promise.resolve(values.get(key) ?? null)),
      set: vi.fn((key: string, value: string) => {
        values.set(key, value);
        return Promise.resolve("OK");
      }),
    },
  };
});

const network = vi.fn<typeof fetch>();
const contentHost = "content.fixture.test";
const tokenEndpoint =
  "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/oauth2/v2.0/token";
const connection = {
  accountId,
  connectionId: "760779e6-ee5d-4149-9c24-d896ca371113",
  contentHost,
  driveId: "personal-drive",
  rootId: "drive!public-folder",
  rootPath: ["Public"],
};

vi.mock("server-only", () => ({}));
vi.mock("@/env", () => ({ env: config }));
vi.mock("@/lib/files/redis", () => ({ requireFilesRedis: () => redis }));

beforeEach(() => {
  vi.clearAllMocks();
  network.mockReset();
  records.clear();
  vi.stubGlobal("fetch", network);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function refreshedResponse(token: string) {
  const [uid, utid] = accountId.split(".");
  return Response.json({
    access_token: token,
    client_info: Buffer.from(JSON.stringify({ uid, utid })).toString(
      "base64url"
    ),
    expires_in: 3600,
    refresh_token: "rotated-fixture-refresh-token",
    scope: "https://graph.microsoft.com/Files.Read",
    token_type: "Bearer",
  });
}

function record(tokenCache = filesTokenCache()): OneDriveConnection {
  return { ...connection, tokenCache };
}

test("cached credentials and the published folder are saved together and read without contacting Microsoft", async () => {
  await saveDriveConnection(record());
  const [sealed] = records.values();
  expect(sealed).toEqual(expect.any(String));
  expect(sealed).not.toContain(accessToken);
  expect(sealed).not.toContain(refreshToken);
  expect(sealed).not.toContain(connection.driveId);

  const drive = await openPublishedDrive();
  expect(drive).toMatchObject({
    connectionId: connection.connectionId,
    contentHosts: new Set([contentHost]),
    driveId: connection.driveId,
    rootId: connection.rootId,
    rootPath: connection.rootPath,
  });
  expect(drive.accessToken()).toBe(accessToken);
  expect(network).not.toHaveBeenCalled();
});

test("the folder path isolates the encrypted connection", async () => {
  await saveDriveConnection(record());
  config.FILES_BASE_DIRECTORY = "Another folder";
  vi.resetModules();
  try {
    const shifted = await import("@/lib/files/connection");
    await expect(shifted.openPublishedDrive()).rejects.toThrow("unconfigured");
    expect(network).not.toHaveBeenCalled();
  } finally {
    config.FILES_BASE_DIRECTORY = "Public";
  }
});

test("a work account uses its tenant and a separate saved connection", async () => {
  await saveDriveConnection(record());
  const tenantId = "760779e6-ee5d-4149-9c24-d896ca371120";
  config.FILES_TENANT_ID = tenantId;
  vi.resetModules();
  try {
    const work = await import("@/lib/files/connection");
    await expect(work.openPublishedDrive()).rejects.toThrow("unconfigured");
    await work.saveDriveConnection({
      ...record(filesTokenCache("work-token", 3600, tenantId)),
      accountId: `${accountId.split(".")[0]}.${tenantId}`,
      driveId: "b!work-drive",
    });
    const drive = await work.openPublishedDrive();
    expect(drive.accessToken()).toBe("work-token");
    expect(drive.driveId).toBe("b!work-drive");
    expect(records.size).toBe(2);
    expect(network).not.toHaveBeenCalled();
    network.mockResolvedValueOnce(
      Response.json({ driveType: "business", id: "b!work-drive" })
    );
    await expect(getOwnerDrive(drive)).resolves.toEqual({
      driveType: "business",
      id: drive.driveId,
    });
  } finally {
    config.FILES_TENANT_ID = undefined;
    vi.resetModules();
  }
});

test("legacy folder protection requires an explicit change before publishing", async () => {
  config.FILES_PROTECTED_FOLDERS = '{"private":"fixture-hash"}';
  vi.resetModules();
  try {
    const { getSettings } = await import("@/lib/files/settings");
    expect(() => getSettings()).toThrow("unconfigured");
  } finally {
    config.FILES_PROTECTED_FOLDERS = "{}";
  }
});

test("concurrent Graph requests share one token refresh and persist the rotated cache", async () => {
  await saveDriveConnection(record());
  const item = { folder: {}, id: connection.rootId, name: "Public" };
  network
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(refreshedResponse("renewed"))
    .mockResolvedValueOnce(Response.json(item))
    .mockResolvedValueOnce(Response.json(item));

  const drive = await openPublishedDrive();
  await expect(
    Promise.all([getGraphItem(drive, []), getGraphItem(drive, [])])
  ).resolves.toEqual([item, item]);

  const [first, second, refresh, ...retries] = network.mock.calls;
  expect(first?.[1]?.headers).toEqual({
    Authorization: `Bearer ${accessToken}`,
  });
  expect(second?.[1]?.headers).toEqual(first?.[1]?.headers);
  expect(String(refresh?.[0])).toContain(tokenEndpoint);
  const form = new URLSearchParams(String(refresh?.[1]?.body));
  expect(form.get("client_id")).toBe(clientId);
  expect(form.get("grant_type")).toBe("refresh_token");
  expect(form.get("refresh_token")).toBe(refreshToken);
  expect(form.get("scope")).toContain("https://graph.microsoft.com/Files.Read");
  expect(retries.map(([, init]) => init?.headers)).toEqual([
    { Authorization: "Bearer renewed" },
    { Authorization: "Bearer renewed" },
  ]);
  expect(redis.eval).toHaveBeenCalledTimes(1);
  expect([...records.values()][0]).not.toContain(
    "rotated-fixture-refresh-token"
  );
  expect((await openPublishedDrive()).accessToken()).toBe("renewed");
  expect(network).toHaveBeenCalledTimes(5);
});

test("a refresh in flight preserves a newer sign-in and cannot change drives mid-request", async () => {
  await saveDriveConnection(record());
  const drive = await openPublishedDrive();
  network.mockImplementationOnce(async () => {
    await saveDriveConnection({
      ...record(filesTokenCache("reconnected")),
      connectionId: "760779e6-ee5d-4149-9c24-d896ca371114",
      driveId: "reconnected-drive",
    });
    return refreshedResponse("stale-refresh");
  });

  await expect(drive.refresh?.(accessToken)).rejects.toThrow("unavailable");
  expect(drive.accessToken()).toBe(accessToken);
  const reconnected = await openPublishedDrive();
  expect(reconnected.driveId).toBe("reconnected-drive");
  expect(reconnected.accessToken()).toBe("reconnected");
  expect(network).toHaveBeenCalledTimes(1);
});

test("a revoked connection returns setup required", async () => {
  await saveDriveConnection(record(filesTokenCache(accessToken, -60)));
  network.mockResolvedValueOnce(
    Response.json({ error: "invalid_grant" }, { status: 400 })
  );

  await expect(openPublishedDrive()).rejects.toThrow("unconfigured");
  expect(redis.eval).not.toHaveBeenCalled();
});

test("download requests reject malformed and unapproved hosts, including on redirects", async () => {
  const hosts = new Set([contentHost]);
  await expect(fetchGraphContent(hosts, "not a URL")).rejects.toThrow(
    "unavailable"
  );
  await expect(
    fetchGraphContent(hosts, "https://unapproved.example.test/file")
  ).rejects.toThrow("unavailable");
  expect(network).not.toHaveBeenCalled();

  network.mockResolvedValueOnce(
    Response.redirect("https://unapproved.example.test/file")
  );
  await expect(
    fetchGraphContent(hosts, `https://${contentHost}/file`)
  ).rejects.toThrow("unavailable");
  expect(network).toHaveBeenCalledTimes(1);
  expect(
    new Headers(network.mock.calls[0]?.[1]?.headers).has("authorization")
  ).toBe(false);
});

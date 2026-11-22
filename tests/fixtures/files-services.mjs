import { createCipheriv, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  accessToken,
  accountId,
  clientId,
  filesTokenCache,
  refreshToken,
} from "./files-token-cache.mjs";

const driveId = "fixture-drive";
const rootId = "fixture-root";
const driveRoot = "drive-root";
const graph = "https://graph.microsoft.com";
const contentHost = "files-fixture.example.test";
const redisHost = "redis-fixture.example.test";
const secret = "fixture-only-signing-secret-000000";
const rootPath = ["Public"];
const downloadSuffix = "/content";
const thumbnailSuffix = "/thumbnails";
const byteRange = /^bytes=(\d+)-(\d*)$/;
const search = /^([^/]+)\/search\(q='(.*)'\)$/;

Object.assign(process.env, {
  ARCJET_KEY: "",
  FILES_BASE_DIRECTORY: rootPath.join("/"),
  FILES_CLIENT_ID: clientId,
  FILES_CLIENT_SECRET: "fixture-only-client-secret",
  FILES_CONTENT_HOSTS: "",
  FILES_PROTECTED_FOLDERS: "{}",
  FILES_SIGNING_SECRET: secret,
  FILES_TENANT_ID: "",
  UPSTASH_REDIS_REST_URL: `https://${redisHost}`,
  UPSTASH_REDIS_REST_TOKEN: "fixture-only-redis-token",
});

const items = new Map();
const blobs = new Map();
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII=",
  "base64"
);

function addItem(id, parent, name, body) {
  const ancestor = items.get(parent);
  const path = ancestor
    ? `${ancestor.parentReference.path}/${encodeURIComponent(ancestor.name)}`
    : "/drive/root:";
  const item = {
    id,
    name,
    lastModifiedDateTime: "2026-11-01T02:00:00Z",
    parentReference: { driveId, id: parent, path },
  };
  if (body === undefined) {
    item.folder = {};
  } else {
    item.file = {};
    const bytes = Buffer.from(body);
    item.size = bytes.byteLength;
    blobs.set(id, bytes);
  }
  items.set(id, item);
}

addItem(rootId, driveRoot, "Public");
addItem("private", driveRoot, "Private");
addItem("hidden", "private", "private-notes.txt", "Private fixture");
addItem("docs", rootId, "Documents");
addItem("archive", rootId, "Archive");
addItem(
  "readme",
  rootId,
  "README.md",
  "# Public archive\n\n[Read the guide](Documents/Guide.txt)"
);
addItem("encoded", rootId, "50% ready #1.txt", "Unicode test: 資料");
addItem("art", rootId, "Photo.png", pixel);
addItem("shortcut", rootId, "Unpublished shortcut");
items.get("shortcut").remoteItem = { id: "private" };
addItem("large", "archive", "large.bin", Buffer.alloc(5 * 1024 * 1024, 65));
addItem("guide", "docs", "Guide.txt", "Public file fixture");
addItem("nested", "docs", "Nested");
addItem("deep", "nested", "Deep");
addItem("deep-guide", "deep", "Deep guide.txt", "Nested public file fixture");
for (const [id, name] of Object.entries({
  pdf: "sample.pdf",
  word: "sample.docx",
  slides: "sample.pptx",
  workbook: "sample.xlsx",
})) {
  addItem(
    id,
    "docs",
    name,
    readFileSync(new URL(`./files/${name}`, import.meta.url))
  );
}
addItem(
  "project-url",
  "docs",
  "Project.url",
  "[InternetShortcut]\r\nURL=https://example.test/?a=b&c=d\r\n"
);

function listChildren(parent) {
  return [...items.values()].filter(
    (item) => item.parentReference.id === parent
  );
}

function itemResponse(url, ancestor, relative = "") {
  let id = ancestor;
  if (relative) {
    for (const segment of relative.split("/")) {
      const name = decodeURIComponent(segment).toLowerCase();
      id = listChildren(id).find(
        (candidate) => candidate.name.toLowerCase() === name
      )?.id;
      if (!id) {
        return new Response(null, { status: 404 });
      }
    }
  }
  const item = items.get(id);
  if (!item) {
    return new Response(null, { status: 404 });
  }
  const location = `https://${contentHost}/file/${id}`;
  // Guide.txt exercises the download endpoint when the metadata omits the URL.
  return Response.json(
    item.file &&
      id !== "guide" &&
      url.searchParams.get("select")?.includes("@microsoft.graph.downloadUrl")
      ? { ...item, "@microsoft.graph.downloadUrl": location }
      : item
  );
}

function handleGraph(url) {
  const { pathname } = url;
  if (pathname === "/v1.0/me/drive") {
    return Response.json({ driveType: "personal", id: driveId });
  }
  const ownerPrefix = "/v1.0/me/drive/root:/";
  if (pathname.startsWith(ownerPrefix)) {
    return itemResponse(url, driveRoot, pathname.slice(ownerPrefix.length));
  }
  const prefix = `/v1.0/drives/${driveId}/items/`;
  if (!pathname.startsWith(prefix)) {
    return new Response(null, { status: 404 });
  }
  const suffix = pathname.slice(prefix.length);
  const separator = suffix.indexOf(":/");
  if (separator >= 0) {
    return itemResponse(
      url,
      suffix.slice(0, separator),
      suffix.slice(separator + 2)
    );
  }
  if (suffix.endsWith(downloadSuffix)) {
    const id = suffix.slice(0, -downloadSuffix.length);
    return blobs.has(id)
      ? Response.redirect(`https://${contentHost}/file/${id}`)
      : new Response(null, { status: 404 });
  }
  if (suffix.endsWith("/children")) {
    const parent = suffix.replace("/children", "");
    const value = listChildren(parent);
    const offset = Number(url.searchParams.get("$skiptoken") ?? 0);
    const page = value.slice(offset, offset + 4);
    if (value.length > offset + page.length) {
      url.searchParams.set("$skiptoken", String(offset + page.length));
      return Response.json({ "@odata.nextLink": url.href, value: page });
    }
    return Response.json({ value: page });
  }
  if (suffix.endsWith(thumbnailSuffix)) {
    const item = items.get(suffix.slice(0, -thumbnailSuffix.length));
    return Response.json({
      value: item?.file
        ? [{ medium: { url: `https://${contentHost}/thumbnail/${item.id}` } }]
        : [],
    });
  }
  const match = search.exec(decodeURIComponent(suffix));
  if (match?.[1] === rootId) {
    const term = match[2].replaceAll("''", "'").toLowerCase();
    // Include stale outside results to exercise the app's scope check.
    return Response.json({
      value: [...items.values()].filter((item) =>
        item.name.toLowerCase().includes(term)
      ),
    });
  }
  return itemResponse(url, suffix);
}

function handleContent(url, headers) {
  if (headers.has("authorization")) {
    return new Response(null, { status: 403 });
  }
  if (url.pathname.startsWith("/thumbnail/")) {
    return new Response(pixel, { headers: { "content-type": "image/png" } });
  }
  const bytes = blobs.get(url.pathname.split("/").at(-1));
  if (!bytes) {
    return new Response(null, { status: 404 });
  }
  const range = byteRange.exec(headers.get("range") ?? "");
  if (range) {
    const first = Number(range[1]);
    const last = Math.min(
      bytes.length - 1,
      range[2] ? Number(range[2]) : bytes.length - 1
    );
    return new Response(bytes.subarray(first, last + 1), {
      headers: {
        "content-length": String(last - first + 1),
        "content-range": `bytes ${first}-${last}/${bytes.length}`,
      },
      status: 206,
    });
  }
  return new Response(bytes, {
    headers: { "content-length": String(bytes.length) },
  });
}

function fixtureRedis() {
  const scope = JSON.stringify([clientId, rootPath]);
  const key = (purpose) =>
    createHmac("sha256", secret).update(
      `onedrive-personal:v2:${purpose}:${scope}`
    );
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key("cache").digest(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(
      JSON.stringify({
        accountId,
        connectionId: "760779e6-ee5d-4149-9c24-d896ca371116",
        contentHost,
        driveId,
        rootId,
        rootPath,
        tokenCache: filesTokenCache(),
      })
    ),
    cipher.final(),
  ]);
  const sealed = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64url"
  );
  return new Map([
    [`files:onedrive-personal:v2:${key("redis").digest("hex")}`, sealed],
  ]);
}

const values = fixtureRedis();
const expirations = new Map();

function redisValue(key) {
  const expiresAt = expirations.get(key);
  if (expiresAt !== undefined && expiresAt <= Date.now()) {
    expirations.delete(key);
    values.delete(key);
  }
  return values.get(key) ?? null;
}

function setRedisValue(key, value, seconds) {
  values.set(key, value);
  if (seconds === undefined) {
    expirations.delete(key);
  } else {
    expirations.set(key, Date.now() + Number(seconds) * 1000);
  }
}

function redisCommand([command, ...args]) {
  switch (command.toLowerCase()) {
    case "ping":
      return "PONG";
    case "get":
      return redisValue(args[0]);
    case "set": {
      const [key, value, ...options] = args;
      if (options.includes("nx") && redisValue(key) !== null) {
        return null;
      }
      const expiry = options.indexOf("ex");
      setRedisValue(key, value, expiry < 0 ? undefined : options[expiry + 1]);
      return "OK";
    }
    case "eval": {
      const [, , key, previous, replacement, seconds] = args;
      const current = redisValue(key);
      if (seconds === undefined && current !== previous) {
        return 0;
      }
      if (
        seconds !== undefined &&
        current !== null &&
        JSON.parse(current).freshUntil !== Number(previous)
      ) {
        return 0;
      }
      setRedisValue(key, replacement, seconds);
      return 1;
    }
    default:
      throw new Error(`Unexpected fixture Redis command: ${command}`);
  }
}

function redisResponse(command, headers) {
  const result = redisCommand(command);
  return {
    result:
      typeof result === "string" && headers.get("upstash-encoding") === "base64"
        ? Buffer.from(result).toString("base64")
        : result,
  };
}

function handleOwnerSignIn(init) {
  const form = new URLSearchParams(String(init?.body));
  const code = form.get("code");
  if (form.get("grant_type") !== "authorization_code" || !code) {
    return Response.json({ error: "invalid_grant" }, { status: 400 });
  }
  const [uid, tid] = accountId.split(".");
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const claims = { aud: clientId, nonce: code, oid: uid, sub: uid, tid };
  return Response.json({
    access_token: accessToken,
    client_info: encode({ uid, utid: tid }),
    expires_in: 3600,
    id_token: `${encode({ alg: "RS256" })}.${encode(claims)}.fixture`,
    refresh_token: refreshToken,
    scope: "https://graph.microsoft.com/Files.Read",
    token_type: "Bearer",
  });
}

// Only fixture processes install this shim. The application uses its normal clients.
const fetchNetwork = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined)
  );
  if (url.hostname === "login.microsoftonline.com") {
    return handleOwnerSignIn(init);
  }
  if (url.origin === graph) {
    return headers.get("authorization") === `Bearer ${accessToken}`
      ? handleGraph(url)
      : new Response(null, { status: 401 });
  }
  if (url.hostname === contentHost) {
    return handleContent(url, headers);
  }
  if (url.hostname === redisHost) {
    const body = JSON.parse(init?.body ?? (await input.text()));
    return Response.json(
      url.pathname.endsWith("/pipeline")
        ? body.map((command) => redisResponse(command, headers))
        : redisResponse(body, headers)
    );
  }
  return await fetchNetwork(input, init);
};

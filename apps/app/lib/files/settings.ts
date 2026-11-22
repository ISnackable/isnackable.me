import "server-only";
import { z } from "zod";
import { env } from "@/env";
import { FilesError } from "./errors";
import { readFilePath } from "./paths";

export const oneDriveId = z.string().regex(/^[A-Za-z0-9!_.-]{1,256}$/);
export const contentHostname = z.string().regex(/^[a-z\d][a-z\d.-]*\.[a-z]+$/);
const outerSlashes = /^\/|\/$/g;
const oldFolderProtection = z.record(z.string(), z.unknown());

export interface FilesSettings {
  readonly baseDirectory: readonly string[];
  readonly clientId: string;
  readonly clientSecret: string;
  readonly contentHosts: ReadonlySet<string>;
  readonly secret: string;
  readonly tenantId?: string;
}

function loadSettings(): FilesSettings {
  const {
    FILES_BASE_DIRECTORY: configuredPath,
    FILES_CLIENT_ID: clientId,
    FILES_CLIENT_SECRET: clientSecret,
    FILES_CONTENT_HOSTS: hostList,
    FILES_PROTECTED_FOLDERS: protectedFolders = "{}",
    FILES_SIGNING_SECRET: secret,
    FILES_TENANT_ID: tenantId,
  } = env;
  const baseDirectory = readFilePath(
    configuredPath?.replace(outerSlashes, "") ?? null
  );
  if (!(baseDirectory?.length && clientId && clientSecret && secret)) {
    throw new FilesError("unconfigured");
  }

  try {
    // Require an explicit cutover before publishing a previously protected tree.
    if (
      Object.keys(oldFolderProtection.parse(JSON.parse(protectedFolders)))
        .length
    ) {
      throw new FilesError("unconfigured");
    }
    const hosts = hostList ? hostList.split(",") : [];
    const contentHosts = new Set(
      hosts.map((host) => contentHostname.parse(host.trim().toLowerCase()))
    );
    return {
      baseDirectory,
      clientId,
      clientSecret,
      contentHosts,
      secret,
      tenantId: tenantId?.toLowerCase(),
    };
  } catch {
    // biome-ignore lint/style/useErrorCause: The configuration error may contain a password hash.
    throw new FilesError("unconfigured");
  }
}

let settings: FilesSettings | undefined;

export function getSettings() {
  settings ??= loadSettings();
  return settings;
}

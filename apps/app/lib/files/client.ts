import { FilesError } from "./errors";
import type { FilesErrorCode } from "./types";

export async function fetchFilesJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body: { error?: FilesErrorCode } | null = await response
      .json()
      .catch(() => null);
    throw new FilesError(body?.error ?? "unavailable");
  }
  return await response.json();
}

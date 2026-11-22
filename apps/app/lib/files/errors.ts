import type { FilesErrorCode } from "./types";

export class FilesError extends Error {
  readonly code: FilesErrorCode;

  constructor(code: FilesErrorCode) {
    super(code);
    this.code = code;
  }
}

export function filesErrorCode(error: unknown): FilesErrorCode {
  return error instanceof FilesError ? error.code : "unavailable";
}

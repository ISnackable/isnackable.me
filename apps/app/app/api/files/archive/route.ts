import type { NextRequest } from "next/server";
import { archiveResponse } from "@/lib/files/archive";
import { jsonError, noStore, readArchivePaths } from "@/lib/files/http";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  // Browsers can send Origin: null on same-origin forms under no-referrer.
  if (
    (fetchSite && fetchSite !== "same-origin") ||
    (origin &&
      origin !== request.nextUrl.origin &&
      !(origin === "null" && fetchSite === "same-origin"))
  ) {
    return new Response(null, { headers: noStore, status: 403 });
  }
  try {
    return await archiveResponse(
      await readArchivePaths(request),
      request.signal
    );
  } catch (error) {
    return jsonError(error);
  }
}

import { getBaseUrl } from "@repo/config/url";
import { secure } from "@repo/security";
import type { NextRequest } from "next/server";
import { env } from "@/env";
import { archiveResponse } from "@/lib/files/archive";
import { jsonError, noStore, readArchivePaths } from "@/lib/files/http";

export const maxDuration = 300;
const portfolioOrigin = getBaseUrl(env.NEXT_PUBLIC_WEB_URL).origin;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  // Browsers can send Origin: null on same-origin forms under no-referrer.
  if (
    (fetchSite && fetchSite !== "same-origin") ||
    (origin &&
      origin !== request.nextUrl.origin &&
      origin !== portfolioOrigin &&
      !(origin === "null" && fetchSite === "same-origin"))
  ) {
    return new Response(null, { headers: noStore, status: 403 });
  }

  const denied = await secure(["CATEGORY:PREVIEW"], request, {
    requestsPerMinute: 5,
  });
  if (denied) {
    return denied;
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

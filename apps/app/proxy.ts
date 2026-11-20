import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import { noseconeOptions, securityMiddleware } from "@repo/security/proxy";
import { type NextProxy, type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

const securityHeaders = securityMiddleware(noseconeOptions);

const proxy = async (request: NextRequest) => {
  if (env.ARCJET_KEY) {
    try {
      await secure(["CATEGORY:PREVIEW"], request);
    } catch (error) {
      const message = parseError(error);
      return NextResponse.json({ error: message }, { status: 403 });
    }
  }

  return securityHeaders();
};

export default proxy as unknown as NextProxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

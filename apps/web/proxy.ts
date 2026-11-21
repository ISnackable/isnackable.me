import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import { noseconeOptions, securityMiddleware } from "@repo/security/proxy";
import { createNEMO } from "@zanreal/nemo";
import { type NextProxy, type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, Posthog ingest, the
  // Sanity Studio (`/studio`), API routes, and Draft Mode endpoints —
  // those must bypass i18n rewriting and Arcjet security checks.
  matcher: [
    "/((?!_next/static|_next/image|ingest|monitoring|robots\\.txt|sitemap\\.xml|favicon.ico|studio|api|assets|typst|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

const securityHeaders = securityMiddleware(noseconeOptions);

// Custom middleware for Arcjet security checks
const arcjetMiddleware = async (request: NextRequest) => {
  if (!env.ARCJET_KEY) {
    return;
  }

  try {
    await secure(
      [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
        "CATEGORY:PREVIEW", // Allow preview links to show OG images
        "CATEGORY:MONITOR", // Allow uptime monitoring services
      ],
      request
    );
  } catch (error) {
    const message = parseError(error);
    return NextResponse.json({ error: message }, { status: 403 });
  }
};

// Compose middleware with Nemo
const composedMiddleware = createNEMO(
  {},
  {
    before: [internationalizationMiddleware, arcjetMiddleware],
  }
);

const proxy = async (request: NextRequest, event: Parameters<NextProxy>[1]) => {
  const headersResponse = await securityHeaders();
  const middlewareResponse = await composedMiddleware(
    request as unknown as NextRequest,
    event
  );

  if (middlewareResponse) {
    headersResponse.headers.forEach((value, key) => {
      middlewareResponse.headers.set(key, value);
    });
    return middlewareResponse;
  }

  return headersResponse;
};

export default proxy as unknown as NextProxy;

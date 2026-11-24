import { isLocale, locales } from "@repo/internationalization/locales";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { secure } from "@repo/security";
import { publicContentBots } from "@repo/security/bots";
import { nosecone, noseconeOptions } from "@repo/security/proxy";
import type { NextProxy } from "next/server";

export const config = {
  // Static assets and service routes bypass locale rewriting and Arcjet.
  matcher: [
    "/((?!_next/static|_next/image|monitoring|robots\\.txt|sitemap\\.xml|favicon.ico|studio|api|assets|typst|files(?:-static)?(?:/|$)|(?:en|ja|zh)/files(?:/|$)|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

const securityHeaders = nosecone(noseconeOptions);

// Next.js adds a hash to metadata routes inside route groups.
const socialImagePath = new RegExp(
  `^/(?:${locales.join("|")})(?:/(?:blog|projects|resume)|/(?:blog|projects|legal)/[^/]+)?/opengraph-image-[a-z0-9]{1,6}$`
);
const resumePdfPath = new RegExp(`^/(?:${locales.join("|")})/resume/pdf$`);

const proxy: NextProxy = async (request) => {
  const pathname = request.nextUrl.pathname;
  const isRead = request.method === "GET" || request.method === "HEAD";
  // Preview services may fetch images with a separate HTTP client.
  const allow =
    isRead && socialImagePath.test(pathname) ? null : publicContentBots;
  // The PDF handler protects requests that reach the origin for compilation.
  const denied =
    isRead && resumePdfPath.test(pathname)
      ? undefined
      : await secure(allow, request);
  const response = denied ?? internationalizationMiddleware(request);

  const [, first, second] = pathname.split("/");
  if (first === "legal" || (isLocale(first) && second === "legal")) {
    // Legal alternates come from published translation relationships.
    response.headers.delete("Link");
  }

  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
};

export default proxy;

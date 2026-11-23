import { filesHref } from "@repo/config/url";
import { isLocale } from "@repo/internationalization/locales";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { secure } from "@repo/security";
import { noseconeOptions, securityMiddleware } from "@repo/security/proxy";
import { type NextProxy, NextResponse } from "next/server";
import { env } from "./env";

const securityHeaders = securityMiddleware(noseconeOptions);
const trailingSlash = /\/$/;

const proxy: NextProxy = async (request) => {
  const pathname = request.nextUrl.pathname.replace(trailingSlash, "") || "/";
  const isApi = pathname.startsWith("/api/");
  if (env.ARCJET_KEY) {
    try {
      await secure(["CATEGORY:PREVIEW"], request);
    } catch {
      return NextResponse.json(
        { error: "denied" },
        {
          headers: { "Cache-Control": "private, no-store" },
          status: 403,
        }
      );
    }
  }

  const security = await securityHeaders();
  if (isApi) {
    if (
      pathname === "/api/files/content" ||
      pathname === "/api/files/thumbnail"
    ) {
      // The byte routes set the resource policy for public embeds.
      security.headers.delete("Cross-Origin-Resource-Policy");
    }
    return security;
  }

  const localized = internationalizationMiddleware(request);
  if (pathname === "/") {
    const location = URL.parse(
      localized.headers.get("location") ?? "",
      request.url
    );
    const locale = location?.pathname.slice(1);
    if (location && isLocale(locale)) {
      location.pathname = filesHref(locale);
      localized.headers.set("location", location.href);
    }
  }
  for (const [name, value] of security.headers) {
    if (!name.startsWith("x-middleware-") && name !== "referrer-policy") {
      localized.headers.set(name, value);
    }
  }
  return localized;
};

export default proxy;

export const config = {
  // File page segments legitimately contain dots and file extensions.
  matcher: [
    "/",
    "/files/:path*",
    "/:locale(en|ja|zh)/files/:path*",
    "/api/files/:path*",
  ],
};

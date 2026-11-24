import { filesHref } from "@repo/config/url";
import { isLocale } from "@repo/internationalization/locales";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { secure } from "@repo/security";
import { linkPreviewBots } from "@repo/security/bots";
import { type NextProxy, type NextRequest, NextResponse } from "next/server";

const isApiRequest = (request: NextRequest) =>
  request.nextUrl.pathname.startsWith("/api/");

const proxy: NextProxy = async (request) => {
  // The archive handler applies bot protection and its download limit together.
  if (
    request.method === "POST" &&
    request.nextUrl.pathname === "/api/files/archive"
  ) {
    return NextResponse.next();
  }

  const apiRequest = isApiRequest(request);
  const denied = await secure(
    apiRequest ? ["CATEGORY:PREVIEW"] : linkPreviewBots,
    request
  );
  if (denied) {
    return denied;
  }

  if (apiRequest) {
    return NextResponse.next();
  }

  const localized = internationalizationMiddleware(request);
  if (request.nextUrl.pathname === "/") {
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

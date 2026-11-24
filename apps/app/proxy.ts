import { filesHref } from "@repo/config/url";
import { isLocale } from "@repo/internationalization/locales";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { secure } from "@repo/security";
import { linkPreviewBots } from "@repo/security/bots";
import { type NextProxy, type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

const isApiRequest = (request: NextRequest) =>
  request.nextUrl.pathname.startsWith("/api/");

const arcjetMiddleware = async (request: NextRequest) => {
  if (!env.ARCJET_KEY) {
    return;
  }

  try {
    await secure(
      isApiRequest(request) ? ["CATEGORY:PREVIEW"] : linkPreviewBots,
      request
    );
  } catch {
    return NextResponse.json(
      { error: "denied" },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 }
    );
  }
};

const proxy: NextProxy = async (request) => {
  const denied = await arcjetMiddleware(request);
  if (denied) {
    return denied;
  }

  if (isApiRequest(request)) {
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

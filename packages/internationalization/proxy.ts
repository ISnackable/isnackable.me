import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

const intlMiddleware = createMiddleware(routing);

export const internationalizationMiddleware = (request: NextRequest) =>
  intlMiddleware(request);

// https://next-intl-docs.vercel.app/docs/routing/middleware

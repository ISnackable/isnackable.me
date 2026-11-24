import {
  type NoseconeOptions,
  nosecone,
  noseconeOptions,
} from "@repo/security/proxy";
import { markdownImageOrigins } from "./lib/files/preview";

const apiContentSecurityPolicy = {
  directives: { defaultSrc: ["'none'"], sandbox: [] },
} as const;

function responseHeaders(options: NoseconeOptions) {
  const headers = nosecone({
    ...noseconeOptions,
    referrerPolicy: { policy: ["no-referrer"] },
    ...options,
  });
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return Array.from(headers, ([key, value]) => ({ key, value }));
}

export function filesSecurityHeaders() {
  const development = process.env.NODE_ENV === "development";
  return [
    {
      source: "/((?!api(?:/|$)).*)",
      headers: responseHeaders({
        contentSecurityPolicy: {
          directives: {
            baseUri: ["'none'"],
            connectSrc: ["'self'"],
            defaultSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            frameSrc: ["'none'"],
            imgSrc: ["'self'", "data:", "blob:", ...markdownImageOrigins],
            mediaSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'wasm-unsafe-eval'",
              ...(development ? (["'unsafe-eval'"] as const) : []),
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            workerSrc: ["'self'", "blob:"],
          },
        },
      }),
    },
    {
      source: "/api/:path((?!files/(?:content|thumbnail)/?$).*)?",
      headers: responseHeaders({
        contentSecurityPolicy: apiContentSecurityPolicy,
      }),
    },
    {
      source: "/api/files/:endpoint(content|thumbnail)",
      headers: responseHeaders({
        contentSecurityPolicy: apiContentSecurityPolicy,
        // Successful public byte responses set their own resource policy.
        crossOriginResourcePolicy: false,
      }),
    },
  ];
}

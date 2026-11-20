import type { init } from "@sentry/nextjs";

// Keep the v10 collection and tracing behavior when upgrading the SDK.
export const sentryDefaults: Parameters<typeof init>[0] = {
  attachStacktrace: false,
  traceLifecycle: "static",
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    },
    httpBodies: [],
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    graphQL: { document: false, variables: false },
    frameContextLines: 7,
  },
};

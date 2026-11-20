/*
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { sentryDefaults } from "./options";

type SentrySDK = typeof import("@sentry/nextjs");
type Initialization = Promise<ReturnType<SentrySDK["init"]>>;
let sdk: SentrySDK | undefined;
let initialization: Initialization | undefined;

export const initializeSentry = (): Initialization | undefined => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }
  initialization ??= Promise.all([import("@sentry/nextjs"), import("./keys")])
    .then(([Sentry, { keys }]) => {
      keys();
      sdk = Sentry;
      return Sentry.init({
        ...sentryDefaults,
        dsn,
        environment:
          process.env.SENTRY_ENVIRONMENT ||
          (process.env.NEXT_PUBLIC_VERCEL_ENV
            ? `vercel-${process.env.NEXT_PUBLIC_VERCEL_ENV}`
            : process.env.NODE_ENV),

        // Adjust this value in production, or use tracesSampler for greater control
        tracesSampleRate: 1,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: false,

        replaysOnErrorSampleRate: 1,

        /*
         * This sets the sample rate to be 10%. You may want this to be 100% while
         * in development and sample at a lower rate in production
         */
        replaysSessionSampleRate: 0.1,

        // You can remove this option if you're not planning to use the Sentry Session Replay feature:
        integrations: [
          Sentry.browserSessionIntegration({ lifecycle: "route" }),
          Sentry.replayIntegration({
            // Additional Replay configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
          }),
          // Send console.log, console.error, and console.warn calls as logs to Sentry
          Sentry.consoleLoggingIntegration({
            levels: ["log", "error", "warn"],
          }),
        ],
      });
    })
    .catch((): undefined => {
      // Monitoring is optional; a failed SDK download must leave the app usable.
      sdk = undefined;
      initialization = undefined;
    });
  return initialization;
};

export const onRouterTransitionStart: SentrySDK["captureRouterTransitionStart"] =
  (...args) => {
    if (sdk) {
      sdk.captureRouterTransitionStart(...args);
    } else if (initialization) {
      initialization.then(() => sdk?.captureRouterTransitionStart(...args));
    }
  };

export const captureClientException = async (error: unknown): Promise<void> => {
  await initializeSentry();
  sdk?.captureException(error);
};

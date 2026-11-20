import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analytics: {
    NEXT_PUBLIC_POSTHOG_KEY: undefined as string | undefined,
    NEXT_PUBLIC_POSTHOG_HOST: undefined as string | undefined,
  },
  sentry: { NEXT_PUBLIC_SENTRY_DSN: undefined as string | undefined },
  posthogInit: vi.fn(),
  sentryInit: vi.fn(),
  validateAnalytics: vi.fn(),
  validateSentry: vi.fn(),
  navigation: vi.fn(),
  exception: vi.fn(),
  session: vi.fn(() => "session"),
  replay: vi.fn(() => "replay"),
  logging: vi.fn(() => "logging"),
}));

vi.mock("@repo/analytics/keys", () => ({
  keys: () => {
    mocks.validateAnalytics();
    return mocks.analytics;
  },
}));
vi.mock("@repo/observability/keys", () => ({
  keys: () => {
    mocks.validateSentry();
    return mocks.sentry;
  },
}));
vi.mock("posthog-js", () => ({ default: { init: mocks.posthogInit } }));
vi.mock("@sentry/nextjs", () => ({
  init: mocks.sentryInit,
  captureRouterTransitionStart: mocks.navigation,
  captureException: mocks.exception,
  browserSessionIntegration: mocks.session,
  replayIntegration: mocks.replay,
  consoleLoggingIntegration: mocks.logging,
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.analytics.NEXT_PUBLIC_POSTHOG_KEY = undefined;
  mocks.analytics.NEXT_PUBLIC_POSTHOG_HOST = undefined;
  mocks.sentry.NEXT_PUBLIC_SENTRY_DSN = undefined;
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", undefined);
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", undefined);
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", undefined);
});

afterEach(() => vi.unstubAllEnvs());

function configureTelemetry() {
  mocks.analytics.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
  mocks.analytics.NEXT_PUBLIC_POSTHOG_HOST = "https://example.com";
  mocks.sentry.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.com/1";
  vi.stubEnv(
    "NEXT_PUBLIC_POSTHOG_KEY",
    mocks.analytics.NEXT_PUBLIC_POSTHOG_KEY
  );
  vi.stubEnv(
    "NEXT_PUBLIC_POSTHOG_HOST",
    mocks.analytics.NEXT_PUBLIC_POSTHOG_HOST
  );
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", mocks.sentry.NEXT_PUBLIC_SENTRY_DSN);
}

test("unconfigured monitoring and analytics do not initialize SDKs", async () => {
  const { initializeAnalytics } = await import(
    "@repo/analytics/instrumentation-client"
  );
  const { initializeSentry, onRouterTransitionStart, captureClientException } =
    await import("@repo/observability/client");
  expect(initializeAnalytics()).toBeUndefined();
  expect(initializeSentry()).toBeUndefined();
  onRouterTransitionStart("/en/blog", "push");
  expect(mocks.posthogInit).not.toHaveBeenCalled();
  expect(mocks.sentryInit).not.toHaveBeenCalled();
  expect(mocks.navigation).not.toHaveBeenCalled();
  expect(mocks.validateAnalytics).not.toHaveBeenCalled();
  expect(mocks.validateSentry).not.toHaveBeenCalled();
  await captureClientException(new Error("Unconfigured error"));
  expect(mocks.exception).not.toHaveBeenCalled();
});

test("configured SDKs initialize once and preserve collection settings and router tracking", async () => {
  configureTelemetry();
  const { initializeAnalytics } = await import(
    "@repo/analytics/instrumentation-client"
  );
  const { initializeSentry, onRouterTransitionStart, captureClientException } =
    await import("@repo/observability/client");
  const sentryInitialization = initializeSentry();
  onRouterTransitionStart("/en/projects", "push");
  await Promise.all([
    initializeAnalytics(),
    initializeAnalytics(),
    sentryInitialization,
    initializeSentry(),
  ]);
  expect(mocks.posthogInit).toHaveBeenCalledExactlyOnceWith("phc_test", {
    api_host: "https://example.com",
    defaults: "2025-05-24",
  });
  expect(mocks.sentryInit).toHaveBeenCalledTimes(1);
  expect(mocks.validateAnalytics).toHaveBeenCalledTimes(1);
  expect(mocks.validateSentry).toHaveBeenCalledTimes(1);
  expect(mocks.navigation).toHaveBeenCalledWith("/en/projects", "push");
  expect(mocks.sentryInit).toHaveBeenCalledWith(
    expect.objectContaining({
      dsn: "https://public@example.com/1",
      tracesSampleRate: 1,
      traceLifecycle: "static",
      dataCollection: expect.objectContaining({
        userInfo: false,
        cookies: false,
      }),
    })
  );
  expect(mocks.replay).toHaveBeenCalledWith({
    maskAllText: true,
    blockAllMedia: true,
  });
  onRouterTransitionStart("/en/blog", "push");
  expect(mocks.navigation).toHaveBeenCalledWith("/en/blog", "push");
  const error = new Error("Application error");
  await captureClientException(error);
  expect(mocks.exception).toHaveBeenCalledWith(error);
});

test("failed optional SDK initialization leaves startup usable and can retry", async () => {
  configureTelemetry();
  mocks.posthogInit.mockImplementationOnce(() => {
    throw new Error("Analytics unavailable");
  });
  mocks.sentryInit.mockImplementationOnce(() => {
    throw new Error("Monitoring unavailable");
  });
  const { initializeAnalytics } = await import(
    "@repo/analytics/instrumentation-client"
  );
  const { initializeSentry } = await import("@repo/observability/client");
  await expect(initializeAnalytics()).resolves.toBeUndefined();
  await expect(initializeSentry()).resolves.toBeUndefined();
  await initializeAnalytics();
  await initializeSentry();
  expect(mocks.posthogInit).toHaveBeenCalledTimes(2);
  expect(mocks.sentryInit).toHaveBeenCalledTimes(2);
});

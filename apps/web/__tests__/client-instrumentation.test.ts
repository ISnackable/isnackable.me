import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sentry: { NEXT_PUBLIC_SENTRY_DSN: undefined as string | undefined },
  sentryInit: vi.fn(),
  validateSentry: vi.fn(),
  navigation: vi.fn(),
  exception: vi.fn(),
  session: vi.fn(() => "session"),
  replay: vi.fn(() => "replay"),
  logging: vi.fn(() => "logging"),
}));

vi.mock("@repo/observability/keys", () => ({
  keys: () => {
    mocks.validateSentry();
    return mocks.sentry;
  },
}));
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
  mocks.sentry.NEXT_PUBLIC_SENTRY_DSN = undefined;
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", undefined);
});

afterEach(() => vi.unstubAllEnvs());

function configureMonitoring() {
  mocks.sentry.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.com/1";
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", mocks.sentry.NEXT_PUBLIC_SENTRY_DSN);
}

test("unconfigured monitoring does not initialize Sentry", async () => {
  const { initializeSentry, onRouterTransitionStart, captureClientException } =
    await import("@repo/observability/client");
  expect(initializeSentry()).toBeUndefined();
  onRouterTransitionStart("/en/blog", "push");
  expect(mocks.sentryInit).not.toHaveBeenCalled();
  expect(mocks.navigation).not.toHaveBeenCalled();
  expect(mocks.validateSentry).not.toHaveBeenCalled();
  await captureClientException(new Error("Unconfigured error"));
  expect(mocks.exception).not.toHaveBeenCalled();
});

test("Sentry initializes once and preserves collection settings and router tracking", async () => {
  configureMonitoring();
  const { initializeSentry, onRouterTransitionStart, captureClientException } =
    await import("@repo/observability/client");
  const sentryInitialization = initializeSentry();
  onRouterTransitionStart("/en/projects", "push");
  await Promise.all([sentryInitialization, initializeSentry()]);
  expect(mocks.sentryInit).toHaveBeenCalledTimes(1);
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

test("failed Sentry initialization leaves startup usable and can retry", async () => {
  configureMonitoring();
  mocks.sentryInit.mockImplementationOnce(() => {
    throw new Error("Monitoring unavailable");
  });
  const { initializeSentry } = await import("@repo/observability/client");
  await expect(initializeSentry()).resolves.toBeUndefined();
  await initializeSentry();
  expect(mocks.sentryInit).toHaveBeenCalledTimes(2);
});

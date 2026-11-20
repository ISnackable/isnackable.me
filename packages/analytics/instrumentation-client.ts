let initialization: Promise<void> | undefined;

export const initializeAnalytics = () => {
  const NEXT_PUBLIC_POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const NEXT_PUBLIC_POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!(NEXT_PUBLIC_POSTHOG_KEY && NEXT_PUBLIC_POSTHOG_HOST)) {
    return;
  }

  initialization ??= Promise.all([import("posthog-js"), import("./keys")])
    .then(([{ default: posthog }, { keys }]) => {
      keys();
      posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: NEXT_PUBLIC_POSTHOG_HOST,
        defaults: "2025-05-24",
      });
    })
    .catch(() => {
      // An unavailable analytics chunk must not prevent application startup.
      initialization = undefined;
    });
  return initialization;
};

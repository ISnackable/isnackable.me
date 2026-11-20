import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

test.each(["false", "true"])(
  "App page retains its website link with SKIP_ENV_VALIDATION=%s",
  async (skipValidation) => {
    vi.resetModules();
    vi.stubEnv("SKIP_ENV_VALIDATION", skipValidation);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "http://localhost:3001");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");

    const { default: Page } = await import("../app/page");
    render(<Page />);

    expect(
      screen.getByRole("heading", { name: "Start building your app here." })
    ).toBeDefined();
    const link = screen.getByRole("link", { name: "Visit website" });
    expect(link.getAttribute("href")).toBe("http://localhost:3001");
    expect(link.closest("button")).toBeNull();
  }
);

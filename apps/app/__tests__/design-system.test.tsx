import { CodeSnippet } from "@repo/design-system/components/code-snippet";
import { Toaster, toast } from "@repo/design-system/components/ui/toast";
import { handleError } from "@repo/design-system/utils/handle-error";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

vi.mock("@repo/observability/error", () => ({
  parseError: (error: Error) => error.message,
}));

afterEach(() => {
  act(() => toast.close());
  cleanup();
  vi.unstubAllGlobals();
});

test("application errors display a dismissible Base UI toast", async () => {
  render(<Toaster timeout={0} />);

  act(() => handleError(new Error("Unable to save changes")));

  expect(await screen.findByText("Unable to save changes")).toBeDefined();
  fireEvent.focus(screen.getByLabelText("Close toast"));
  fireEvent.click(screen.getByRole("button", { name: "Close toast" }));
  await waitFor(() => {
    expect(screen.queryByText("Unable to save changes")).toBeNull();
  });
});

test("code snippets highlight code and copy the original whitespace", async () => {
  const code = 'const greeting = "Hello";\n\nconsole.log(greeting);\n';
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });

  const { container } = render(
    <CodeSnippet code={code} language="ts" title="greeting.ts" />
  );

  expect(screen.getByText("greeting.ts")).toBeDefined();
  const content = screen.getByLabelText("greeting.ts");
  expect(content.getAttribute("dir")).toBe("ltr");
  expect(content.getAttribute("tabindex")).toBe("0");
  expect(
    container.querySelectorAll('[data-slot="code-block-line"]')
  ).toHaveLength(3);
  await waitFor(() => {
    expect(content.querySelector('[style*="--shiki-light"]')).not.toBeNull();
  });

  fireEvent.click(screen.getByRole("button", { name: "Copy" }));
  await screen.findByRole("button", { name: "Copied" });
  expect(writeText).toHaveBeenCalledWith(code);
});

test("unknown code languages remain readable as plain text", () => {
  render(<CodeSnippet code="some output" language="unsupported-language" />);
  expect(screen.getByText("some output")).toBeDefined();
  expect(screen.getByRole("button", { name: "Copy" })).toBeDefined();
});

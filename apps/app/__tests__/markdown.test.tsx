import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { FileMarkdown } from "@/components/files/markdown";

afterEach(cleanup);

test("renders HTML in Markdown with drive links and approved images", () => {
  const body = `
<div align="center">
  <a href="https://isnackable.me/">
    <img src="https://avatars.githubusercontent.com/u/52971804?s=120" alt="Logo" width="80" height="80">
  </a>
  <h3><a href="/">ISnackable's Drive</a></h3>
  <img style="display: inline-block;" src="https://img.shields.io/badge/OneDrive-blue" alt="OneDrive">
</div>

| Route | Details |
| --- | --- |
| [iOS Shortcuts](/iOS%20Shortcuts/) | Shortcuts |
| [Guide](Guide.md) | Getting started |

![Photo](../Photo.png)
`;
  render(<FileMarkdown body={body} folder={["Documents"]} locale="ja" />);

  const heading = screen.getByRole("heading", { name: "ISnackable's Drive" });
  expect(heading.closest("div")?.getAttribute("align")).toBe("center");
  expect(screen.getByRole("link", { name: "Logo" }).getAttribute("href")).toBe(
    "https://isnackable.me/"
  );
  const logo = screen.getByRole("img", { name: "Logo" });
  expect(logo.getAttribute("src")).toBe(
    "https://avatars.githubusercontent.com/u/52971804?s=120"
  );
  expect(logo.getAttribute("width")).toBe("80");
  expect(logo.getAttribute("height")).toBe("80");
  expect(
    screen.getByRole("img", { name: "OneDrive" }).getAttribute("src")
  ).toBe("https://img.shields.io/badge/OneDrive-blue");
  expect(heading.querySelector("a")?.getAttribute("href")).toBe("/ja/files");
  expect(
    screen.getByRole("link", { name: "iOS Shortcuts" }).getAttribute("href")
  ).toBe("/ja/files/iOS%20Shortcuts");
  expect(screen.getByRole("link", { name: "Guide" }).getAttribute("href")).toBe(
    "/ja/files/Documents/Guide.md"
  );
  expect(screen.getByRole("img", { name: "Photo" }).getAttribute("src")).toBe(
    "/api/files/content?preview=1&path=Photo.png"
  );
});

test("sanitizes embedded HTML and renders a disabled Markdown task list", () => {
  const body = `
<div style="position: fixed">
  <script>script content</script>
  <a href="javascript:void(0)">Unsafe link</a>
  <picture>
    <source srcset="/api/files/browse">
    <img src="/Photo.png" alt="Photo" onerror="noop()">
  </picture>
  <img src="https://other.example/image.png" alt="Other image">
</div>

- [x] Published
`;
  const { container } = render(
    <FileMarkdown body={body} folder={[]} locale="en" />
  );

  expect(
    container.querySelector("script, source, [style], [onerror]")
  ).toBeNull();
  expect(screen.queryByRole("link", { name: "Unsafe link" })).toBeNull();
  expect(
    screen.getByRole("img", { name: "Other image" }).hasAttribute("src")
  ).toBe(false);
  expect(screen.getByRole("img", { name: "Photo" }).getAttribute("src")).toBe(
    "/api/files/content?preview=1&path=Photo.png"
  );
  const task = screen.getByRole<HTMLInputElement>("checkbox");
  expect(task.checked).toBe(true);
  expect(task.disabled).toBe(true);
});

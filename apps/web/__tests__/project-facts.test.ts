import type { PROJECT_QUERY_RESULT } from "@repo/cms";
import messages from "@repo/internationalization/messages/en.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ProjectFacts } from "../app/(main)/[locale]/projects/components/project-facts";

const legacyProject: NonNullable<PROJECT_QUERY_RESULT> = {
  _id: "legacy-project",
  _type: "project",
  title: "Legacy project",
  slug: "legacy-project",
  summary: null,
  role: null,
  organization: null,
  technologies: null,
  status: null,
  startDate: null,
  endDate: null,
  repositoryUrl: null,
  liveUrl: null,
  date: null,
  coverImage: null,
  content: [],
  translations: [],
  seo: {
    title: "Legacy project",
    description: "",
    image: null,
    noIndex: false,
  },
};

function renderFacts(
  overrides: Partial<NonNullable<PROJECT_QUERY_RESULT>> = {}
) {
  return renderToStaticMarkup(
    createElement(ProjectFacts, {
      project: { ...legacyProject, ...overrides },
      copy: messages.web.content,
      locale: "en",
    })
  );
}

test("existing projects without optional details render no empty metadata panel", () => {
  expect(renderFacts()).toBe("");
});

test("only ongoing projects describe a missing end date as present", () => {
  const ongoing = renderFacts({
    startDate: "2025-01-01",
    status: "inProgress",
  });
  expect(ongoing).toContain("Jan 2025 — Present");
  const completed = renderFacts({
    startDate: "2025-01-01",
    status: "completed",
  });
  expect(completed).toContain("Jan 2025");
  expect(completed).not.toContain("Present");
  expect(renderFacts({ startDate: "invalid" })).not.toContain("Invalid Date");
});

test("project source and demo actions remain real external links", () => {
  const html = renderFacts({
    repositoryUrl: "https://github.com/example/project",
    liveUrl: "https://example.com",
    technologies: ["TypeScript"],
  });
  expect(html).toContain('href="https://github.com/example/project"');
  expect(html).toContain('href="https://example.com"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain("TypeScript");
  expect(html).not.toContain("<button");
});

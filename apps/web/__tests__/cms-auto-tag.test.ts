import { handler } from "@repo/cms/functions/auto-tag";
import blueprint from "@repo/cms/sanity.blueprint";
import { evaluate, parse } from "groq-js";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const api = vi.hoisted(() => ({
  getDocument: vi.fn(),
  generate: vi.fn(),
  patch: vi.fn(),
  ifRevisionId: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(),
}));
vi.mock("@sanity/client", () => ({
  createClient: () => ({
    getDocument: api.getDocument,
    agent: { action: { generate: api.generate } },
    patch: api.patch,
  }),
}));

const document = {
  _id: "article",
  _rev: "revision-1",
  _type: "post",
  tags: ["Security", "security", "docker"],
};

async function run({
  local = false,
  id = "article",
  revision = "revision-1",
} = {}) {
  await handler({
    context: { local, clientOptions: {} },
    event: { data: { _id: id, _rev: revision } },
  } as Parameters<typeof handler>[0]);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  api.getDocument.mockResolvedValue(document);
  api.generate.mockResolvedValue({
    tags: [" security ", "Docker", "DOCKER", "AWS", " ", null, 42],
  });
  api.patch.mockReturnValue(api);
  api.ifRevisionId.mockReturnValue(api);
  api.set.mockReturnValue(api);
  api.commit.mockResolvedValue({});
});
afterEach(() => vi.restoreAllMocks());

test("deduplicates existing and generated tags before any write, retaining curated spelling", async () => {
  await run();
  expect(api.generate).toHaveBeenCalledWith(
    expect.objectContaining({
      noWrite: true,
      target: { path: "tags", operation: "set" },
    })
  );
  expect(api.set).toHaveBeenCalledExactlyOnceWith({
    tags: ["Security", "docker", "aws"],
  });
  expect(api.ifRevisionId).toHaveBeenCalledExactlyOnceWith("revision-1");
  expect(api.commit).toHaveBeenCalledExactlyOnceWith({
    returnDocuments: false,
  });
});

test("repeated suggestions leave an already unique tag list unchanged", async () => {
  api.getDocument.mockResolvedValue({
    ...document,
    tags: ["Security", "docker", "aws"],
  });
  await run();
  expect(api.patch).not.toHaveBeenCalled();
});

test("local previews never patch the Content Lake", async () => {
  await run({ local: true });
  expect(api.generate.mock.calls[0][0].noWrite).toBe(true);
  expect(api.patch).not.toHaveBeenCalled();
});

test("projects write Technologies, retain proper casing and use only project technology vocabulary", async () => {
  api.getDocument.mockResolvedValue({
    ...document,
    _type: "project",
    technologies: ["TypeScript", "typescript", "React"],
  });
  api.generate.mockResolvedValue({
    technologies: [" react ", "Next.js", "TypeScript", "next.JS", " "],
  });
  await run();
  const request = api.generate.mock.calls[0][0];
  expect(request.target).toEqual({ path: "technologies", operation: "set" });
  expect(request.instructionParams.summary).toEqual({
    type: "field",
    path: "summary",
  });
  const vocabulary = request.instructionParams.vocabulary;
  const dataset = [
    { _id: "post", _type: "post", tags: ["security"] },
    {
      _id: "project",
      _type: "project",
      technologies: ["React", "TypeScript"],
      tags: ["obsolete-topic"],
    },
    { _id: "drafts.private", _type: "project", technologies: ["private"] },
    {
      _id: "versions.release.private",
      _type: "project",
      technologies: ["future"],
    },
    { _id: "article", _type: "project", technologies: ["self"] },
  ];
  const tags = await (
    await evaluate(parse(vocabulary.query), {
      dataset,
      params: vocabulary.params,
    })
  ).get();
  expect(tags.sort()).toEqual(["React", "TypeScript"]);
  expect(api.set).toHaveBeenCalledExactlyOnceWith({
    technologies: ["TypeScript", "React", "Next.js"],
  });
});

test("blog vocabulary does not mix technology labels or retired project tags into topics", async () => {
  await run();
  const vocabulary = api.generate.mock.calls[0][0].instructionParams.vocabulary;
  const dataset = [
    { _id: "other-post", _type: "post", tags: ["security"] },
    {
      _id: "project",
      _type: "project",
      tags: ["obsolete-topic"],
      technologies: ["React"],
    },
  ];
  const tags = await (
    await evaluate(parse(vocabulary.query), {
      dataset,
      params: vocabulary.params,
    })
  ).get();
  expect(tags).toEqual(["security"]);
});

test("repeated project suggestions do not change curated spelling or create a Tags field", async () => {
  api.getDocument.mockResolvedValue({
    ...document,
    _type: "project",
    technologies: ["TypeScript"],
  });
  api.generate.mockResolvedValue({
    technologies: ["typescript", "TYPESCRIPT"],
  });
  await run();
  expect(api.patch).not.toHaveBeenCalled();
});

test.each([undefined, ["TypeScript"]])(
  "an empty technology result never invents labels or removes curated values",
  async (technologies) => {
    api.getDocument.mockResolvedValue({
      ...document,
      _type: "project",
      technologies,
    });
    api.generate.mockResolvedValue({ technologies: [] });
    await run();
    expect(api.patch).not.toHaveBeenCalled();
  }
);

test("ignores event deliveries superseded by another edit or a prior tagging run", async () => {
  api.getDocument.mockResolvedValue({ ...document, _rev: "revision-2" });
  await run();
  expect(api.generate).not.toHaveBeenCalled();
  expect(api.patch).not.toHaveBeenCalled();
});

test.each(["drafts.article", "versions.release.article"])(
  "does not tag or publish %s",
  async (id) => {
    await run({ id });
    expect(api.getDocument).not.toHaveBeenCalled();
    expect(api.generate).not.toHaveBeenCalled();
  }
);

test.each([null, { ...document, _type: "settings" }])(
  "skips deleted or unsupported documents",
  async (value) => {
    api.getDocument.mockResolvedValue(value);
    await run();
    expect(api.generate).not.toHaveBeenCalled();
  }
);

test("does not retry a revision conflict over a newer editor change", async () => {
  api.commit.mockRejectedValue({ statusCode: 409 });
  await expect(run()).resolves.toBeUndefined();
  expect(api.commit).toHaveBeenCalledTimes(1);
});

test("surfaces service failures instead of reporting success", async () => {
  const error = new Error("Service unavailable");
  api.commit.mockRejectedValue(error);
  await expect(run()).rejects.toBe(error);
});

test.each([undefined, [null, 5, " "]])(
  "rejects unusable AI output without changing stored tags",
  async (tags) => {
    api.generate.mockResolvedValue({ tags });
    await expect(run()).rejects.toThrow("no valid tags");
    expect(api.patch).not.toHaveBeenCalled();
  }
);

test("limits new suggestions without discarding curated tags", async () => {
  api.getDocument.mockResolvedValue({ ...document, tags: ["Curated"] });
  api.generate.mockResolvedValue({
    tags: ["aws", "aws", "docker", "security", "extra"],
  });
  await run();
  expect(api.set).toHaveBeenCalledWith({
    tags: ["Curated", "aws", "docker", "security"],
  });
});

const resource = blueprint().resources?.find(
  (item) => item.name === "auto-tag"
);
if (resource?.type !== "sanity.function.document") {
  throw new Error("Expected the auto-tag document function resource.");
}
// BlueprintModule erases resource-specific properties from its return type.
const eventConfig = (
  resource as typeof resource & {
    event: { filter: string; projection: string };
  }
).event;

test.each(["post", "project"])(
  "the %s trigger handles creation and source edits, but never its own label writes",
  async (_type) => {
    const after = {
      _id: "item",
      _type,
      title: "Original",
      summary: "Summary",
      tags: ["security"],
    };
    const trigger = parse(eventConfig.filter, { mode: "delta" });
    const matches = async (before: unknown, value: unknown) =>
      await (
        await evaluate(trigger, { root: value, before, after: value })
      ).get();
    expect(await matches(null, after)).toBe(true);
    expect(await matches(after, { ...after, title: "Changed title" })).toBe(
      true
    );
    expect(await matches(after, { ...after, summary: "Changed summary" })).toBe(
      true
    );
    expect(
      await matches(after, { ...after, description: "Changed description" })
    ).toBe(true);
    expect(
      await matches(after, {
        ...after,
        content: [{ _type: "block", children: [] }],
      })
    ).toBe(true);
    expect(
      await matches(after, { ...after, tags: ["security", "docker"] })
    ).toBe(false);
    expect(
      await matches(after, { ...after, technologies: ["TypeScript", "React"] })
    ).toBe(false);
  }
);

test("the trigger excludes other document types and includes revision metadata", async () => {
  const value = {
    _id: "item",
    _rev: "rev",
    _type: "settings",
    title: "Settings",
  };
  const trigger = parse(eventConfig.filter, { mode: "delta" });
  expect(
    await (
      await evaluate(trigger, { root: value, before: null, after: value })
    ).get()
  ).toBe(false);
  expect(
    await (await evaluate(parse(eventConfig.projection), { root: value })).get()
  ).toEqual({ _id: "item", _rev: "rev", _type: "settings" });
});

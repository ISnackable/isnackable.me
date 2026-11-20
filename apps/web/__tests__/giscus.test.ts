import { POST_QUERY } from "@repo/cms/queries";
import { getGiscusConfig, giscusLanguage } from "@repo/comments/config";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";
import { articleDiscussionTerm } from "@/lib/comments";

test("comments require a complete repository/category configuration", () => {
  expect(getGiscusConfig({})).toBeNull();
  const env = {
    GISCUS_REPO: " owner/repo ",
    GISCUS_REPO_ID: "repo-id",
    GISCUS_CATEGORY: "Comments",
    GISCUS_CATEGORY_ID: "category-id",
  };
  expect(getGiscusConfig(env)).toEqual({
    repo: "owner/repo",
    repoId: "repo-id",
    category: "Comments",
    categoryId: "category-id",
  });
  expect(getGiscusConfig({ ...env, GISCUS_CATEGORY_ID: "" })).toBeNull();
  expect(
    getGiscusConfig({ ...env, GISCUS_REPO: "https://github.com/owner/repo" })
  ).toBeNull();
});

test("discussion identities survive slug changes and supported locales map to Giscus languages", () => {
  expect(articleDiscussionTerm("drafts.example-id")).toBe("post:example-id");
  expect(articleDiscussionTerm("example-id")).toBe("post:example-id");
  expect(["en", "ja", "zh"].map(giscusLanguage)).toEqual(["en", "ja", "zh-CN"]);
});

test.each([undefined, true, false])(
  "article comment preference %s preserves old content defaults",
  async (commentsEnabled) => {
    const params = { locale: "en", slug: "article" };
    const dataset = [
      {
        _id: "article",
        _type: "post",
        language: "en",
        slug: { current: "article" },
        commentsEnabled,
      },
    ];
    const post = await (
      await evaluate(parse(POST_QUERY), { dataset, params })
    ).get();
    expect(post.commentsEnabled).toBe(commentsEnabled !== false);
  }
);

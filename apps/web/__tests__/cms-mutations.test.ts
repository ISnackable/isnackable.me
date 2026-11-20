import { BufferedDocument, Mutation } from "@sanity/mutator";
import { expect, test } from "vitest";

function createDraft() {
  return {
    _id: "drafts.project-repro",
    _type: "project",
    _rev: "before-publish",
    role: "Developer",
  };
}

test("publishing while a project detail edit is in flight does not crash Studio", async () => {
  const draft = createDraft();
  const document = new BufferedDocument(draft);
  let acknowledgeCommit: () => void = () => {
    throw new Error("Expected an in-flight commit");
  };
  document.commitHandler = ({ success }) => {
    acknowledgeCommit = success;
  };

  document.add(
    new Mutation({
      mutations: [
        { patch: { id: draft._id, set: { role: "Security researcher" } } },
      ],
    })
  );
  const commit = document.commit();

  // Publishing deletes the draft before the pending edit is acknowledged.
  expect(() =>
    document.arrive(
      new Mutation({
        transactionId: "publish",
        previousRev: draft._rev,
        resultRev: "after-publish",
        mutations: [{ delete: { id: draft._id } }],
      })
    )
  ).not.toThrow();
  expect(document.LOCAL).toBeNull();
  acknowledgeCommit();
  await commit;

  // Further editing can create a new draft after the publish finishes.
  document.add(
    new Mutation({
      mutations: [
        { createIfNotExists: draft },
        { patch: { id: draft._id, set: { role: "Security researcher" } } },
      ],
    })
  );
  expect(document.LOCAL).toMatchObject({ role: "Security researcher" });
});

test("pending patches leave a missing draft absent", () => {
  const mutation = new Mutation({
    mutations: [
      {
        patch: { id: createDraft()._id, set: { role: "Security researcher" } },
      },
    ],
  });

  expect(mutation.apply(null)).toBeNull();
});

test("ordinary project detail edits still apply to existing drafts", () => {
  const draft = createDraft();
  const mutation = new Mutation({
    mutations: [
      {
        patch: {
          id: draft._id,
          set: { role: "Security researcher", technologies: ["TypeScript"] },
        },
      },
    ],
  });

  expect(mutation.apply(draft)).toMatchObject({
    role: "Security researcher",
    technologies: ["TypeScript"],
  });
  expect(draft.role).toBe("Developer");
});

test("patches apply when a mutation recreates a deleted draft", () => {
  const draft = createDraft();
  const mutation = new Mutation({
    mutations: [
      { delete: { id: draft._id } },
      { patch: { id: draft._id, set: { role: "Obsolete edit" } } },
      { createIfNotExists: draft },
      { patch: { id: draft._id, set: { role: "Security researcher" } } },
    ],
  });

  expect(mutation.apply(draft)).toMatchObject({
    _id: draft._id,
    role: "Security researcher",
  });
});

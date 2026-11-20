# Auto-tag posts and projects

This function updates the existing label field when source content changes:

| Document | Field | Suggestions |
| --- | --- | --- |
| Blog post | `tags` | Up to three lowercase topic tags |
| Project | `technologies` | Up to three explicitly named languages, frameworks, libraries, platforms or tools |

Projects keep their existing Technologies field. No separate Project Tags field
is added. Technology suggestions preserve names such as TypeScript, Next.js and
React; the project prompt asks for an empty list when no technologies are named.
An empty result keeps curated values and does not invent labels.

Generate defaults to appending array values. The original function wrote those
values directly, so publishing repeated content edits could append the same tags
again and fail Studio's `rule.unique()` validation. The updated function:

- Generates with `noWrite: true` and `target.operation: "set"`.
- Trims suggestions, removes empty/non-string values, and compares tags without
  case sensitivity. New blog tags use lowercase; technology names retain their casing.
- Keeps existing curated labels and their spelling, removes duplicates, and saves
  the combined list to `tags` or `technologies` with one `set` patch. Existing
  labels can make the final list longer than three.
- Checks the event revision before generation and uses `ifRevisionId` when
  committing. Repeated deliveries and concurrent edits cannot append a second
  copy or overwrite newer editorial work.
- Reuses blog topic vocabulary for blog posts and project technology vocabulary
  for Projects. Drafts and release versions are excluded, and the handler never
  tags or publishes those IDs.
- Excludes tag-only and technology-only writes from the trigger to prevent recursion.

The schema keeps unique-array validation enabled on both document types.
Uniqueness is enforced in code before any generated value reaches Content Lake;
it does not depend on the model following its prompt.

## Validation

From the repository root:

```sh
pnpm --filter web test __tests__/cms-auto-tag.test.ts
pnpm --filter auto-tag typecheck
pnpm --filter @repo/cms typegen
```

The regression tests mock the AI and mutation APIs; they do not spend AI credits
or change stored content. They cover duplicate output, curated tags, Projects,
repeat delivery, revision conflicts, invalid output and trigger recursion.

## Local preview

From `packages/cms`, choose an existing published post or project ID:

```sh
pnpm exec sanity functions test auto-tag --document-id <id> --dataset production --with-user-token
```

Local preview calls Generate but never commits a patch. It can use AI credits.
A prompt result can contain duplicates even with an explicit uniqueness
instruction; the logged preview shows the cleaned list that would be saved.

## Deployment

The Agent Actions schema needs the existing `post.tags` and
`project.technologies` fields. No new Project field or content migration is
required. From `packages/cms`, refresh the schema if necessary, then deploy the
blueprint:

```sh
pnpm exec sanity schema deploy
pnpm exec sanity blueprints deploy
```

A web deployment alone does not deploy this function. Deploying the schema also
updates the published schema snapshot used by Agent Actions; it does not publish
content documents.

Existing duplicate labels are cleaned when the affected document next runs
through this function. If duplicate validation prevents that document from publishing,
remove repeated entries in Studio first.

References: [Agent Actions target operations](https://www.sanity.io/docs/agent-actions/targets-paths#operation),
[Generate without writing](https://www.sanity.io/docs/agent-actions/generate-cheatsheet#create-release-versions-for-ai-changes).

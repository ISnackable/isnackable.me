# CMS package

This package owns Sanity content and Studio. It exports source TypeScript;
Next.js compiles it through the workspace aliases.

| Location | Responsibility |
| --- | --- |
| `schemas/documents`, `schemas/objects` | Editorial models, fields and validation |
| `queries/<content-type>.ts` | GROQ definitions for that collection |
| `queries/fragments.ts`, `queries/content.ts` | Shared base projections and the explicit Portable Text projection |
| `modules/<name>/schema.ts`, `modules/<name>/view.tsx` | Reusable visual module models and renderers shared by pages and Portable Text |
| `modules/` shared files | Module registration, projections, generated prop types, placement attributes and common rendering |
| `data/<content-type>.ts` | Typed, preview-aware reads and their invalidation tags |
| `live.ts` | The single cache boundary and request preview-state resolution |
| `client.ts`, `env.ts`, `keys.ts` | Sanity connection and environment configuration |
| `components/` | React renderers for Sanity images, Portable Text and contents links |
| `content/pages.ts`, `content/about.ts`, `content/site.ts` | Interpret stored portfolio content and provide neutral fallbacks |
| `content/rich-text/` | Heading IDs, contents extraction, reading time and slug generation |
| `content/images.ts`, `content/text.ts`, `content/translations.ts` | Interpret image references, editable text and translation relationships |
| `content/resume.ts` | Résumé content contract |
| `studio/` | Desk structure, templates, preview locations, localization and editor input handling |
| `functions/` | Deployable Sanity functions |
| `sanity.types.ts` | Generated schema/query types; never edit manually |

`index.ts` exposes the public server API (`blog`, `pages`, `projects`, `resume`,
`legal`, `settings`, `sitemap`). `queries.ts` preserves public query imports while
definitions live in the content-specific files. Internal data reads import their
own query file directly.

Root files are integration entrypoints and configuration. Put a content operation
with its domain; avoid adding loose helper files or a generic `utils` directory.
Blog URL parsing and pagination links live in `apps/web/lib/blog-discovery.ts`;
the CMS owns filtering parameters, queries and collection reads.

To change a content feature, start with its schema, update its query projection,
run `pnpm --filter @repo/cms typegen`, then update its data read and consuming UI.
Request APIs stay outside `cachedSanity`; metadata disables stega; static params
use published content. Keep existing fallback behavior for unconfigured datasets.

Site routes and portfolio layout composition belong in `apps/web`. Independent
integrations own their own packages: Giscus rendering, configuration and dependency
live in `@repo/comments`. The CMS only stores `post.commentsEnabled`, the editor's
choice of whether comments should appear on a post.

See [Content modules and styling](../../docs/content-modules.md) for Studio usage,
code-based styling and the module extension workflow. Keep a module's own fields and UI
in its directory; add shared code only when it serves the module system as a whole.

# AGENTS.md

Repo-specific guidance for AI agents working in this project. Read this before editing.

## Commands

All commands run from the repo root unless noted. Package manager is **pnpm** (workspaces in `apps/*` and `packages/*`).

- `pnpm dev` — run the app on :3000, portfolio on :3001, and Studio on :3333 via Turborepo. Access Studio through the portfolio's `/studio` path.
- `pnpm build` — prepare the web build's CMS inputs, then run `turbo build`.
- `pnpm test` — `turbo test` (both apps have regression tests)
- `pnpm build:browser` / `pnpm test:browser` — build for the browser fixture ports, then run production browser regression tests.
- `pnpm test:instant` — build with the navigation testing API, then verify instant navigation on desktop and mobile. Ordinary builds leave this API disabled.
- `pnpm check` / `pnpm fix` — lint + format via **Biome** (wrapped by `ultracite`). There is no ESLint/Prettier.
- `pnpm typecheck` — check the apps, shared source packages, and the Sanity function via Turborepo. Per-package: `pnpm --filter <pkg> typecheck`.
- Single test: `pnpm --filter app test` (runs `NODE_ENV=test vitest run`) or `pnpm --filter app exec vitest run <path>`.
- `pnpm --filter @repo/cms typegen` — regenerate Sanity types (see Generated files).
- `pnpm bump-ui` — regenerate shadcn components in design-system.

Turborepo `build` depends on `^build` **and** `test`, so tests run as part of `pnpm build`.

## Architecture

Monorepo (pnpm + Turborepo). Two Next.js 16 apps, a standalone Sanity Studio, and shared packages.

- `apps/app` — OneDrive file index (port 3000), served from the portfolio's `/files` entry point as a separate Vercel service. The localized layout lives in `app/[locale]/layout.tsx`, with the file browser at `app/[locale]/files/[[...path]]/page.tsx`.
- `apps/web` — portfolio/blog site (port 3001), i18n via `app/(main)/[locale]/`. Owns the Studio Draft Mode endpoints.
- `apps/studio` — Sanity Studio (port 3333), built with the Sanity CLI. Vercel Services routes `/studio` on the portfolio origin to this app.
- `packages/*` — `@repo/<name>`. Each is consumed as **raw TypeScript source** by apps through tsconfig path aliases (`@repo/*` → `../../packages/*`), e.g. `@repo/observability/next-config` resolves to `packages/observability/next-config.ts`. **Do not add `exports`/`main` fields or try to build these packages** — Next.js compiles them directly. Subpath imports map to file paths (no build step, no `dist`).
- `packages/next-config` — shared base `NextConfig`. Web composes it with analytics, observability, CMS, and internationalization settings from their packages.

## Next.js 16 conventions

- Read the installed, version-matched documentation in `apps/web/node_modules/next/dist/docs/` before changing Next.js behavior. The former `vercel-labs/next-skills` best-practices skill was retired upstream; do not rely on an old copy.
- Both apps use Cache Components and Partial Prefetching. Keep request-only APIs outside `"use cache"` boundaries. Sanity queries use the strict cached helper in `packages/cms/live.ts` with explicit perspective and stega options.
- **Middleware is `proxy.ts`, not `middleware.ts`.** Both apps use `proxy.ts` exporting a `NextProxy`. See `apps/app/proxy.ts` and `apps/web/proxy.ts`.
- `NextProxy` / `NextRequest` / `NextResponse` come from `next/server`.

## Environment variables

Validated with `@t3-oss/env-nextjs`. **Convention:** each package that needs env exposes a `keys()` factory in `packages/<name>/keys.ts`; each app composes them in `apps/<app>/env.ts` via `extends: [...]`.

- `SKIP_ENV_VALIDATION=true` bypasses validation for intentional test runs.
- Required vars are documented in `apps/<app>/.env.example`. Copy the CMS example for local Sanity CLI commands. Dotenv files are ignored except `.env.example`.
- Runtime behavior is env-gated: Sentry is only wired into the build when `VERCEL` is set; bundle analyzer runs when `ANALYZE=true`.

## Generated files — do not hand-edit

Excluded from Biome in `biome.jsonc` because they are regenerated:

- `packages/design-system/components/ui`, `packages/design-system/lib`, `packages/design-system/hooks` — shadcn-generated. Regenerate with `pnpm bump-ui`.
- `packages/cms/sanity.types.ts` — Sanity typegen output. Regenerate with `pnpm --filter @repo/cms typegen`.

## CI / deploy

- No GitHub Actions workflows. **Vercel is the CI.** The root `vercel.json` defines all three services.
- Commit message containing `[skip ci]` skips the Vercel build (see `apps/*/scripts/skip-ci.js`).
- See the development guide linked from the README for Vercel setup.

## Style notes

- Reuse `@repo/design-system/components/ui` for controls and UI feedback. Compose built-in variants and semantic theme tokens before adding custom styles.
- TypeScript: strict, `NodeNext` modules (apps use `Bundler` resolution). `@/*` = app-local, `@repo/*` = packages.
- When adding a new shared package, use the Turborepo generator: `npx turbo gen` (loads `turbo/generators/config.ts`, templates in `turbo/generators/templates/`).
- Path aliases must also be mirrored in `apps/app/vitest.config.mts` if tests need to resolve them.

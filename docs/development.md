# Development

## Local setup

Use Node.js 24.15 or later in the 24.x line, or another version supported by
`engines.node`. Install the pnpm version pinned in `package.json`.

```sh
npm install --global pnpm@12.18.0
pnpm install --frozen-lockfile
cp apps/app/.env.example apps/app/.env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/studio/.env.example apps/studio/.env.local
cp packages/cms/.env.example packages/cms/.env.local
```

Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in the web,
Studio, and CMS env files. Use a Sanity project you can edit and a dataset for
published site content. Add `http://localhost:3001` as an allowed CORS origin
with credentials for Studio sign-in. Run `pnpm dev` to start all three apps.
The portfolio forwards local `/studio` requests to Studio on port 3333. Open
[Sanity Studio](http://localhost:3001/studio) to publish the homepage and site
settings. The application starter runs on port 3000.

The Sanity project ID, dataset name, and other `NEXT_PUBLIC_*` values are
included in browser code. Keep provider credentials and webhook secrets in
your local env files or deployment settings. Put the optional
`SANITY_API_READ_TOKEN` and `SANITY_REVALIDATE_SECRET` in the web environment.
Use a read-only Viewer token for authenticated draft previews.

See the [content editing guide](content-and-pages.md) and
[CMS package guide](../packages/cms/README.md).

## Tests and build

```sh
pnpm check
pnpm typecheck
pnpm test
pnpm security:check
pnpm build
pnpm exec playwright install chromium
pnpm test:browser
```

Unit tests use fixtures and mocks, including the Sanity auto-tagging tests.
The production browser suite starts all three apps and uses a configured test
dataset populated with localized pages, posts, projects, and résumé content.
Some scenarios also need preview or comments configured. The suite has
standalone fixtures for component tests such as the folder, content modules,
and lanyard. The [badge build guide](../apps/web/scripts/lanyard/README.md)
describes the snapshot step and the optional
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` setting.

`pnpm test:instant` builds and tests with the Next.js navigation testing API.
Leave `EXPOSE_TESTING_API` unset for production deployments.

## Deploy with Vercel Services

1. Connect the repository to a Vercel project using the **Services** preset and
   leave the root directory at the repository root. The root
   [Vercel configuration](../vercel.json) builds `apps/web` as `web`,
   `apps/app` as `files`, and `apps/studio` as `studio`.
2. Add both domains to the project. Use a hostname that starts with `files.`
   for the files app. Set `NEXT_PUBLIC_WEB_URL` to the portfolio origin and
   `NEXT_PUBLIC_APP_URL` to the files origin in Production. Use full HTTPS URLs.
   Set `ENABLE_EXPERIMENTAL_COREPACK=1` to use the pinned pnpm version.
3. Set the Sanity project ID and dataset using the existing
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` variables.
   Allow the portfolio origin in Sanity CORS with credentials. Check the
   portfolio, a deep link under `/studio`, and Presentation on the portfolio
   domain. Check the `/files` redirect and files app as well.

To register the self-hosted Studio with Sanity Dashboard and Media Library, run
`pnpm --filter studio exec sanity deploy --external --url https://isnackable.me/studio`
after deploying. Use a Sanity account with permission to register the Studio
and publish its schema. [Studio registration](https://www.sanity.io/docs/studio/deployment#register-the-studio-and-deploy-the-schema)

The generated Vercel preview URL opens the portfolio. To preview the files app,
assign a custom hostname that starts with `files.` to the preview branch and set
`NEXT_PUBLIC_APP_URL` to that origin for the branch. Next.js uses that value
for the portfolio's `/files` redirect. Set both URL variables to the same origin
in Preview to disable the redirect there.

Verify both hostnames on a deployment because `vercel dev` skips hostname
conditions. For private drafts and the publishing webhook, use the same Sanity
settings as a [portfolio-only deployment](#deploy-the-portfolio-only).

## Deploy the portfolio only

Use a Vercel Services deployment to serve Studio on the portfolio's `/studio`
path.

1. Connect the repository to a Next.js project in Vercel. Set the root
   directory to `apps/web` and enable access to workspace files outside that
   directory. For an existing deployment of the earlier site, update the root
   directory from `next-web` to `apps/web`. The build command in `apps/web/vercel.json` refreshes badge inputs
   before Turbo checks its cache. [Vercel monorepo settings](https://vercel.com/docs/monorepos/monorepo-faq)
2. Set `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel uses the pinned pnpm version.
   Configure the Sanity public identifiers and set `NEXT_PUBLIC_WEB_URL` to the
   portfolio origin. Set `NEXT_PUBLIC_APP_URL` to the application origin if you
   deploy it, or to the portfolio origin for a portfolio-only deployment.
   Configure Production and Preview separately.
   [Vercel package manager settings](https://vercel.com/docs/builds/configure-a-build#corepack)
3. Add the production origin to Sanity's allowed CORS origins with credentials
   for Studio. To enable draft previews, configure `SANITY_API_READ_TOKEN`. To
   enable the optional publishing webhook, set `SANITY_REVALIDATE_SECRET` in both
   Vercel and the Sanity webhook settings.
   [Sanity CORS settings](https://www.sanity.io/docs/content-lake/cors)
4. Publish the intended pages in Sanity. Use the `privacy` slug for each locale's
   legal index redirect. Verify the homepage, blog, projects, résumé PDF,
   and sitemap on the deployed origin.

See [AGENTS.md](../AGENTS.md) for workspace conventions.

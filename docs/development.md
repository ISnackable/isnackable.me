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
settings. The OneDrive service runs on port 3000 and the portfolio routes
[/files](http://localhost:3001/files) to it. Use the same Sanity project ID and
dataset in `apps/app/.env.local` to show the published site title in the files
header. It defaults to “Portfolio” when no title is available. [Connect a OneDrive folder](#connect-the-files-app-to-onedrive)

In development, the portfolio forwards Files pages, APIs, and assets to port
3000. On Vercel, Services routes those paths directly to the Files app.

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
pnpm build:browser
pnpm exec playwright install chromium
pnpm test:browser
```

Unit tests use fixtures and mocks, including the Sanity auto-tagging tests.
`pnpm build:browser` and Playwright share the addresses in
[`tests/fixtures/browser-servers.mjs`](../tests/fixtures/browser-servers.mjs).
The build command sets `FILES_BROWSER_TEST_ORIGIN` to the local Files server so
the portfolio can forward requests during the browser suite. The suite starts all
three apps and uses a test dataset with localized pages, posts, projects, and
résumé content.
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
2. Add the portfolio domain to the project. Set `NEXT_PUBLIC_WEB_URL` to its
   HTTPS origin in both apps.
   Set `ENABLE_EXPERIMENTAL_COREPACK=1` to use the pinned pnpm version.
3. Set the Sanity project ID and dataset using the existing
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` variables.
   Allow the portfolio origin in Sanity CORS with credentials. Check the
   portfolio, a deep link under `/studio`, and Presentation on the portfolio
   domain. Check `/files` on the portfolio domain and the redirect from the
   files subdomain.
4. Configure the `files.` shortcut with an HTTPS redirect to the portfolio's
   `/files` URL at your hosting provider. Verify it on the deployed hostname.
5. To enable draft previews, configure `SANITY_API_READ_TOKEN`. To enable the
   publishing webhook, set `SANITY_REVALIDATE_SECRET` in both Vercel and the
   Sanity webhook settings. [Sanity CORS settings](https://www.sanity.io/docs/content-lake/cors)

To register the self-hosted Studio with Sanity Dashboard and Media Library, run
`pnpm --filter studio exec sanity deploy --external --url https://isnackable.me/studio`
after deploying. Use a Sanity account with permission to register the Studio
and publish its schema. [Studio registration](https://www.sanity.io/docs/studio/deployment#register-the-studio-and-deploy-the-schema)

The Files zone is available at `/files` on the generated Vercel preview URL.
Localized pages use paths such as `/en/files/Documents`. The shared header links
across the two Next.js zones, which load a new document when you switch apps.
Files assets use `/files-static` and the Files APIs use `/api/files`.

## Connect the files app to OneDrive

Choose one folder on a personal, work, or school OneDrive for anonymous browsing and downloads.
Keep every file under that folder suitable for public access, including the
sample file used during setup. If an earlier deployment used folder passwords,
move those private files outside the publish folder before clearing
`FILES_PROTECTED_FOLDERS`. The app requires an empty or absent legacy protection
setting before it serves files.

1. Create an app registration in Microsoft Entra. For a personal OneDrive,
   choose **Personal Microsoft accounts only**. For a work or school OneDrive,
   choose **Accounts in this organizational directory only** and copy the
   **Directory (tenant) ID** to `FILES_TENANT_ID`. Under **Authentication → Add
   a platform → Web**, register `http://localhost:8765/onedrive/callback`.
   [Register an application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) · [Redirect URI rules](https://learn.microsoft.com/en-us/entra/identity-platform/reply-url)
2. Add the Microsoft Graph **delegated** permission `Files.Read` and create a
   client secret under **Certificates & secrets**. The owner consents to drive
   read access. The app limits what visitors can see to the configured folder.
   [Microsoft Graph permissions](https://learn.microsoft.com/en-us/graph/permissions-reference#filesread)
3. Copy [the files app env example](../apps/app/.env.example) to
   `apps/app/.env.local`. Set `FILES_BASE_DIRECTORY` to the folder path relative
   to the owner's OneDrive root, such as `Public/Shared`. Leave
   `FILES_TENANT_ID` empty for personal OneDrive. Set `FILES_CLIENT_ID`
   to the application ID and `FILES_CLIENT_SECRET` to the secret's original
   **Value**. The Upstash integration supplies `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` on Vercel. Use the same names in `apps/app/.env.local`
   for the HTTPS endpoint and read/write token. Generate `FILES_SIGNING_SECRET`
   with `openssl rand -base64 32`. The app uses it to encrypt the owner connection
   saved in Redis. [Upstash Vercel integration](https://upstash.com/docs/redis/howto/vercelintegration)
4. Run the setup command from the repository root. Replace `sample.txt` with
   the path to an actual file under the publish folder. For example, if
   `FILES_BASE_DIRECTORY` is `Public/Shared`, pass `sample.txt` for
   `Public/Shared/sample.txt` or `Docs/sample.txt` for
   `Public/Shared/Docs/sample.txt`. Sign in with the Microsoft account
   that owns the folder. The command verifies the sample download and saves
   the connection, including the verified download hostname.

   ```sh
   pnpm --filter app connect:onedrive "sample.txt"
   ```

5. Run `pnpm --filter app dev`, then open the file index and try the sample
   download. If Graph uses additional content or thumbnail hosts for this
   drive, add their exact hostnames to `FILES_CONTENT_HOSTS` as a comma-separated
   list. [Local file index](http://localhost:3000/files)

The files app uses Graph for browsing. Redis shares verified first-page
metadata per connection. A listing is fresh for 15 seconds. A
request in the following 15 seconds gets the cached listing immediately and
triggers one background refresh. At 30 seconds, a listing that has yet to
refresh must be fetched from Graph. Returning to a loaded folder shows the
browser's cached entries while it checks for updates. Downloads, previews,
and ZIPs verify the current path before fetching file bytes.
Run the setup command again if the folder is moved or replaced, the signing
secret changes, or Microsoft requires the owner to sign in again.
[Microsoft refresh token lifecycle](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens)

### Verify file sharing before cutover

Use the same connection settings and Redis credentials on a staged files host.
Open a nested folder, test a file link and a direct link, then try previews,
a range download, and a nested ZIP with real OneDrive files.
For local fixture coverage after `pnpm build:browser`, run
`pnpm test:browser tests/browser/files.spec.ts`.

Use **Copy direct link** on a file preview for embeds and download tools.
Direct links support cross-origin requests and byte ranges. **Copy links as a
list** copies one URL per line. Use **Download folder as ZIP** or select up to
200 entries for a streamed ZIP. The server checks for up to 5,000 entries
across all nested levels before starting the download.

See [AGENTS.md](../AGENTS.md) for workspace conventions.

# Comments

Optional Giscus integration, independent of Sanity. `index.tsx` renders the themed
widget; `config.ts` validates public provider identifiers and maps UI languages;
`keys.ts` exposes environment settings for the consuming app to compose.

The app supplies a stable discussion `term`, locale, and validated configuration.
It also decides placement, whether comments are enabled, and whether a preview
should display them. This package does not fetch content or depend on `@repo/cms`.

Configure the four `GISCUS_*` variables documented in `apps/web/.env.example` using
the [Giscus configurator](https://giscus.app). Blank configuration disables the
integration in the web app. No GitHub token is needed.

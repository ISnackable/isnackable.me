# Lanyard previews

The web app owns the capture scripts and their development dependencies. They
render the actual badge into sixteen transparent lossless WebP images per unique
front: desktop/mobile, light/dark, entrance/resting poses, and 1×/2× sizes. There
is no second HTML scene to keep in sync.

## Builds and caching

Use `pnpm build` from the repository root. Its `prebuild` prepares a deterministic
CMS snapshot **before Turbo computes task hashes**. The web app's Vercel build
command uses this entry point too. `apps/web/turbo.json` includes that snapshot
as an explicit input, so web build caching remains enabled. No local `.turbo`
cache files or root Turbo rules need editing.

The snapshot includes normalized badge content plus a fingerprint of all published
Sanity document IDs/revisions. Other CMS page edits therefore invalidate the
cached web build too. It contains no token or timestamp. Unchanged content has
identical bytes. CMS reads have a 30-second deadline; failures stop the build
instead of reusing stale content. The snapshot and generated images are ignored
by Git.

If invoking Turbo directly, prepare its input first:

```sh
pnpm --filter web lanyard:inputs
pnpm exec turbo build --filter=web
```

A direct `pnpm --filter web build` also prepares fresh inputs automatically.
Inside a Turbo task, the generator reads the already-prepared snapshot without
changing it after hashing. Run the input command again before every raw Turbo
invocation that should see new CMS content.

Capture artifacts are cached separately under `.next/cache/lanyard-previews`.
The key includes the front content, capture sources, fonts, graphics dependencies,
platform and browser override. A valid complete artifact skips browser startup.
This cache is rebuildable and can be cleared independently of source files.

## Capture commands

```sh
pnpm --filter web lanyard:previews     # Published homepage content
pnpm --filter web lanyard:smoke        # Synthetic portrait and Latin/CJK text
```

The generator reads the same environment files as a production Next build. An
unconfigured CMS or a page without a badge produces an empty manifest. Portrait
download, font loading and scene preparation have explicit deadlines, with browser,
server and staging cleanup on failure. Smoke captures go under `.next/cache`,
without changing published preview output or contacting the CMS.

Linux builds use `@sparticuz/chromium` 153 with `playwright-core` 1.63, whose
tested browser is Chromium 153. The generator checks that the major versions
match. Update and smoke-test these dependencies together. This dedicated driver
does not change the repository's Playwright test runner. The capture pair has
also been verified on Linux x64. Docker is not required by the build.

For local capture, install Chrome or run
`pnpm --filter web exec playwright-core install chromium`. Alternatively set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Capture uses software WebGL for portability.
Capture-only Arimo and Noto fonts supply Arial-compatible metrics and CJK glyphs;
the live badge keeps its system font stack. Minor platform raster differences
can remain during the 150 ms blend.

## Runtime behavior

Images are written to `apps/web/public/assets/lanyard/generated`; the server
manifest is `apps/web/generated/lanyard/previews.json`. Only the visible variant
loads, at the resolution selected by the browser for its pixel density. Images
preserve their aspect ratio inside the hero container. Front text and the portrait
determine its content key. A later Sanity edit
invalidates the old preview until the next deployment; back-only edits preserve
the front preview. Restart an existing dev server after generating a new manifest
to reload its cached lookup.

The worker holds its complete first frame until the preview fades, then releases
the shared entrance pose. Restoring a retained Next.js page resets the preview
while a replacement worker prepares. Each pending preparation has its own
ten-second deadline. Worker errors, unsupported OffscreenCanvas or timeouts retain
the resting preview. Without a matching preview, the existing hero space remains
reserved. No main-thread 3D fallback is loaded.

Physics uses fixed steps and stops scheduling frames after settling; clicks,
visibility and configuration changes wake it when needed. Reduced motion starts
in the resting pose. Dragging stays disabled, and browser pinch zoom is preserved.
When changing the pose or badge styling, bump `LANYARD_PREVIEW_VERSION` in
`lanyard-preview.ts`.

The mobile browser regression uses 6x CPU throttling and a frame heartbeat with
a 150 ms maximum gap. Use the browser's normal hardware graphics backend for
that check. Software WebGL capture is a different workload and does not model
a phone's GPU. The report includes the graphics backend and main-thread long
tasks. Browser coverage also checks Activity restoration, stalled replacement
preparation, and sleep/wake under deliberately uneven frame times.

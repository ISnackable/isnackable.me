# Content modules and styling

The same Callout, Image gallery, Attributed quote and Accordion modules work in the
homepage builder and in article content. They reuse schemas and renderers, while
each placement owns its content. No marketing page types or shared
content documents are required.

## Author in Studio

- **Pages → Home → Page content → Page builder:** add, reorder or remove modules
  alongside the existing Hero, About, Projects and Writing sections. Those four
  portfolio sections remain unique; visual modules can repeat. The builder accepts
  up to 30 placements.
- **Blog posts / Projects → Content:** insert a module between text blocks, images
  or code. Legal content uses the same Portable Text vocabulary.
- Open a module's **Display** tab for **Anchor** and **Hide module**. Existing
  portfolio sections have these controls too. An empty anchor defaults to
  `module-<placement key>`. Set an explicit anchor before sharing a permanent link.
- For ordinary quotations, select **Quote** in the writing toolbar. Use the
  **Attributed quote** object when the quotation has structured author/source fields.

| Module | Content controls | Default behavior |
| --- | --- | --- |
| Callout | Optional heading, note/tip/warning tone, rich text | Design-system Alert with a tone icon; warning uses the destructive variant |
| Image gallery | Optional heading, 1–3 columns, up to 18 images with alt text, crop/hotspot and captions | Responsive grid with the design-system AspectRatio primitive |
| Attributed quote | Quote, attribution, source title and optional source URL | Design-system Typeset typography and semantic quote/source markup |
| Accordion | Optional heading, up to 24 summaries and rich-text answers, initially expanded setting | Design-system Accordion with keyboard controls; several answers may stay open |

Callout and accordion text supports paragraphs, bold, italic, code, links and
lists. It is a text-only leaf: inserting another module inside it is deliberately
disabled. Place additional modules between top-level article blocks instead.
Hidden modules stay editable in Studio and are omitted from public queries,
rendering, search and reading-time text.
Accordion answers stay in server-rendered HTML even when initially collapsed.
Controls and feedback use existing design-system primitives and semantic theme
tokens.

## Styling and scope

The hero's **Folder** tab contains **Selected content**: choose up to three
existing projects or blog posts in the page's language, then drag to reorder.
The folder uses their current titles and summaries and links to their detail
pages. Images are optional on those documents and are never needed by the folder.
An optional **Folder label** overrides the translated label. Empty or unavailable
selections hide the widget. Desktop and mobile use the same React Bits opening
flap and paper fan, with responsive sizing.

Style components in `modules/<name>/view.tsx` through the existing design-system
components, their variants and semantic theme tokens. The web app owns page layout
and the design system owns shared UI primitives and typography. This is the normal
frontend styling workflow; editors author content rather than CSS.

Raw CSS editing in Studio is deferred. SanityPress stores per-module `scopedCss`
and renders it inside `@scope`; adopting that separate authoring feature is not
necessary to own and style the frontend source. The initial prototype was removed
after review: CSS scope limits selectors, but global definitions such as keyframes
and registered custom properties can still affect other elements.

Ordinary Portable Text quotations already preserve inline formatting and links.
The `quoteModule` type remains for attributed quotations, with separate author,
source title and source URL fields. Its stored type name and rendering are retained
for existing content; its Studio label explains that narrower purpose.

## Extend the implementation

Each module lives in `packages/cms/modules/<name>/` with `schema.ts` and `view.tsx`.
`defineModule` calls Sanity's `defineType` and supplies the common Display tab
and placement attributes. It preserves schema names, fields, previews and options;
it does not rename stored `_type` values or register frontend renderers. Register schemas
and Portable Text members in `modules/schema.ts`, add the module name to the
`visualModuleTypes` catalog in `modules/types.ts` and add explicit GROQ fields in
`modules/query.ts`. Wire its view in `modules/renderer.tsx`; the shared catalog
connects it to Portable Text and the homepage automatically. `modules/types.ts`
derives props from TypeGen. Top-level module headings default to H2; module anchors
leave space for the fixed header. `modules/anchors.ts` owns placement IDs and
collision validation, including the reserved comments heading.
Add reader-visible text to the query and plain-text extraction when appropriate,
so discovery and reading time include the new content.

Keep rich-text leaves separate from the top-level module renderer to avoid
recursive schemas and circular component imports. Rendering files must remain
usable from Portable Text's client boundary; server-only data reads belong in
`data/`. Schema registration never imports module views.
The web stylesheet explicitly scans CMS and comments package sources for Tailwind
utilities. Include the source path when another app consumes these renderers.

After changing schemas or projections, run `pnpm --filter @repo/cms typegen` and
check that all 16 query types were generated. Run `pnpm check`, `pnpm typecheck`
and `pnpm test`, then build and check changed UI in desktop/mobile browsers.
See `apps/web/__tests__/modules.test.ts` for projection and rendering coverage, and
`tests/browser/modules.spec.ts` for theme defaults, anchors and disclosure interaction.

These fields are additive. Existing documents keep their current layout until an
editor adds modules; no content migration or remote publication is needed.

import { PortableText } from "@repo/cms/components/portable-text";
import { VisualModuleView } from "@repo/cms/modules/renderer";
import Loadable from "next/dist/shared/lib/loadable.shared-runtime";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import type {
  codeFixture,
  moduleFixtures,
} from "../../../../tests/fixtures/cms-modules";

/** Render the real shared components without creating test-only application routes. */
export async function renderModuleBrowserContent(
  fixtures: typeof moduleFixtures,
  code: typeof codeFixture
) {
  // Match Next's dynamic-loader initialization in this standalone SSR fixture.
  await Loadable.preloadAll();
  const [callout, gallery, quote, accordion] = fixtures;
  const linked = {
    ...callout,
    attributes: {
      uid: "reader-note",
      hidden: false,
    },
  };
  const stream = await renderToReadableStream(
    createElement(
      "div",
      {},
      createElement(
        "div",
        { id: "page-modules" },
        createElement(VisualModuleView, { module: linked }),
        createElement(VisualModuleView, {
          module: { ...gallery, columns: 3, images: [] },
        })
      ),
      createElement(
        "article",
        { id: "article-modules", className: "typeset typeset-article" },
        createElement(PortableText, { value: [quote, accordion] })
      ),
      createElement(
        "div",
        { id: "code-fixture" },
        createElement(PortableText, { value: [code] })
      )
    )
  );
  await stream.allReady;
  return new Response(stream).text();
}

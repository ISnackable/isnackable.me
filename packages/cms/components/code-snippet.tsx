"use client";

import dynamic from "next/dynamic";

const CodeSnippet = dynamic(() =>
  import("@repo/design-system/components/code-snippet").then(
    (module) => module.CodeSnippet
  )
);

/** Keep interactive code blocks separate from server-rendered article prose. */
export function PortableCodeSnippet(props: {
  code: string;
  language?: string;
  title?: string;
}) {
  return <CodeSnippet {...props} />;
}

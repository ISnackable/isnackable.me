import type { TypedObject } from "@portabletext/types";
import { stegaClean } from "@sanity/client/stega";
import Link from "next/link";
import {
  PortableText as BasePortableText,
  type PortableTextBlock,
  type PortableTextComponentProps,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
  type PortableTextTypeComponentProps,
} from "next-sanity";
import { Image } from "next-sanity/image";
import { useMemo } from "react";
import { getHeadingAnchors } from "../content/rich-text/headings";
import { VisualModuleView } from "../modules/renderer";
import { type VisualModule, visualModuleTypes } from "../modules/types";
import { PortableCodeSnippet } from "./code-snippet";

export type { TypedObject as PortableTextNode } from "@portabletext/types";
export type { PortableTextBlock } from "next-sanity";

/* ---------------------------------------------------------------------------------------------
 * Custom block value shapes — match the `code` and `image` members declared
 * in `packages/cms/schemas/objects/block-content.ts`.
 * --------------------------------------------------------------------------------------------- */

interface CodeBlockValue {
  _key: string;
  _type: "code";
  code?: string;
  filename?: string;
  language?: string;
}

interface ImageBlockValue {
  _key: string;
  _type: "image";
  alt?: string;
  asset?: {
    _id: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number };
    };
  };
  caption?: string;
}

/* ---------------------------------------------------------------------------------------------
 * Mark components
 * --------------------------------------------------------------------------------------------- */

const marks: PortableTextComponents["marks"] = {
  link: ({
    value,
    children,
  }: PortableTextMarkComponentProps<
    TypedObject & { href?: string; openInNewTab?: boolean }
  >) => {
    const href = value?.href;
    const openInNewTab = value?.openInNewTab;
    if (!href) {
      return <>{children}</>;
    }

    const external = href.startsWith("http") || href.startsWith("mailto");
    if (external) {
      return (
        <a
          href={href}
          rel={openInNewTab ? "noreferrer" : undefined}
          target={openInNewTab ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    }
    return <Link href={href}>{children}</Link>;
  },
};

/* ---------------------------------------------------------------------------------------------
 * Block components — headings get stable IDs so the TOC can anchor to them.
 * --------------------------------------------------------------------------------------------- */

const heading =
  (level: 2 | 3 | 4, anchors: Map<string | undefined, string>) =>
  ({ children, value }: PortableTextComponentProps<PortableTextBlock>) => {
    const Tag = `h${level}` as "h2" | "h3" | "h4";
    const id = anchors.get(value._key);
    const title = stegaClean(
      value.children.map((span) => span.text ?? "").join("")
    );
    return (
      <Tag
        aria-label={title || undefined}
        className="group scroll-mt-24"
        id={id}
      >
        {children}
        <a
          className="ml-2 rounded-sm text-muted-foreground no-underline opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring pointer-fine:opacity-0 pointer-fine:group-hover:opacity-60"
          href={`#${id}`}
        >
          <span aria-hidden="true">#</span>
          <span className="sr-only">{title || "#"}</span>
        </a>
      </Tag>
    );
  };

/* ---------------------------------------------------------------------------------------------
 * Custom type components
 * --------------------------------------------------------------------------------------------- */

const visualModule = ({
  value,
}: PortableTextTypeComponentProps<VisualModule>) => (
  <VisualModuleView module={value} />
);

const types: PortableTextComponents["types"] = {
  ...Object.fromEntries(visualModuleTypes.map((type) => [type, visualModule])),
  code: ({ value }: PortableTextTypeComponentProps<CodeBlockValue>) => {
    const { code = "", language, filename } = value;
    return (
      <PortableCodeSnippet
        code={stegaClean(code)}
        language={stegaClean(language)}
        title={filename}
      />
    );
  },
  image: ({ value }: PortableTextTypeComponentProps<ImageBlockValue>) => {
    if (!value?.asset?.url) {
      return null;
    }
    const dimensions = value.asset.metadata?.dimensions;
    return (
      <figure className="my-6">
        <Image
          alt={value.alt ?? ""}
          blurDataURL={value.asset.metadata?.lqip ?? undefined}
          height={dimensions?.height ?? 630}
          placeholder={value.asset.metadata?.lqip ? "blur" : undefined}
          sizes="(min-width: 1024px) 768px, 100vw"
          src={value.asset.url}
          width={dimensions?.width ?? 1200}
        />
        {value.caption ? (
          <figcaption className="mt-2 text-center text-muted-foreground text-sm">
            {value.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  },
};

export const portableTextComponents: PortableTextComponents = {
  marks,
  types,
};

/* ---------------------------------------------------------------------------------------------
 * Pre-wired renderer. Pass `components` to override specific handlers.
 * --------------------------------------------------------------------------------------------- */

export function PortableText({
  value,
  components,
  idPrefix = "",
}: {
  value: TypedObject[];
  components?: PortableTextComponents;
  idPrefix?: string;
}) {
  const headingComponents = useMemo(() => {
    const anchors = new Map(
      getHeadingAnchors(value, idPrefix).map(({ key, id }) => [key, id])
    );
    return {
      h2: heading(2, anchors),
      h3: heading(3, anchors),
      h4: heading(4, anchors),
    };
  }, [value, idPrefix]);
  const resolvedComponents = useMemo(() => {
    const block = components?.block;
    return {
      ...portableTextComponents,
      ...components,
      marks: { ...marks, ...components?.marks },
      types: { ...types, ...components?.types },
      block:
        typeof block === "function" || (block && "$$typeof" in block)
          ? block
          : { ...headingComponents, ...block },
    };
  }, [components, headingComponents]);
  return <BasePortableText components={resolvedComponents} value={value} />;
}

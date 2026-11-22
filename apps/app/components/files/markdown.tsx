import type { Locale } from "@repo/internationalization/locales";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { browseHref, filesApiHref, isFilePath } from "@/lib/files/paths";
import { previewType } from "@/lib/files/preview";

const markdownOrigin = "https://relative.invalid";
const externalLink = /^(?:https?:\/\/|mailto:)/i;

function relativeReference(href: string, folder: readonly string[]) {
  if (href.startsWith("//") || href.startsWith("/")) {
    return null;
  }
  try {
    const prefix = folder.map((name) => encodeURIComponent(name)).join("/");
    const target = new URL(
      href,
      `${markdownOrigin}/${prefix ? `${prefix}/` : ""}`
    );
    const path = target.pathname
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
    return target.origin === markdownOrigin && isFilePath(path)
      ? { hash: target.hash, path }
      : null;
  } catch {
    return null;
  }
}

export function FileMarkdown({
  body,
  folder,
  locale,
}: {
  readonly body: string;
  readonly folder: readonly string[];
  readonly locale: Locale;
}) {
  return (
    <div className="typeset overflow-x-auto wrap-break-word text-sm">
      <Markdown
        components={{
          a({ children, href }) {
            if (href?.startsWith("#")) {
              return <a href={href}>{children}</a>;
            }
            const reference = href && relativeReference(href, folder);
            if (reference) {
              return (
                <Link
                  href={browseHref(locale, reference.path) + reference.hash}
                  prefetch={false}
                >
                  {children}
                </Link>
              );
            }
            if (href && externalLink.test(href)) {
              return (
                <a href={href} rel="noreferrer">
                  {children}
                </a>
              );
            }
            return <>{children}</>;
          },
          img({ alt, src }) {
            const reference =
              typeof src === "string" && relativeReference(src, folder);
            if (
              !reference ||
              previewType(reference.path.at(-1) ?? "").kind !== "image"
            ) {
              return alt ? <span>{alt}</span> : null;
            }
            return (
              // biome-ignore lint/performance/noImgElement lint/correctness/useImageSize: OneDrive does not provide image dimensions for Markdown links.
              <img
                alt={alt ?? ""}
                decoding="async"
                loading="lazy"
                src={filesApiHref("content", reference.path, { preview: "1" })}
              />
            );
          },
        }}
        remarkPlugins={[remarkGfm]}
        skipHtml
      >
        {body}
      </Markdown>
    </div>
  );
}

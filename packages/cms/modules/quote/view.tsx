import { stegaClean } from "@sanity/client/stega";
import type { ModuleOf } from "../types";

const httpUrl = /^https?:\/\//i;

export function Quote({ module }: { module: ModuleOf<"quoteModule"> }) {
  const url = stegaClean(module.sourceUrl ?? "");
  return (
    <figure>
      <blockquote>
        <p className="whitespace-pre-line">{module.quote}</p>
      </blockquote>
      {module.attribution || module.sourceLabel ? (
        <figcaption>
          {module.attribution}
          {module.attribution && module.sourceLabel ? " · " : null}
          {module.sourceLabel ? (
            <cite className="not-italic">
              {httpUrl.test(url) ? (
                <a href={url}>{module.sourceLabel}</a>
              ) : (
                module.sourceLabel
              )}
            </cite>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

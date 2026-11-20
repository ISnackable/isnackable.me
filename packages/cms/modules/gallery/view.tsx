import { AspectRatio } from "@repo/design-system/components/ui/aspect-ratio";
import { cn } from "@repo/design-system/lib/utils";
import { SanityImage } from "../../components/sanity-image";
import type { ModuleHeadingLevel, ModuleOf } from "../types";

export function Gallery({
  module,
  headingLevel,
}: {
  module: ModuleOf<"galleryModule">;
  headingLevel: ModuleHeadingLevel;
}) {
  const Tag = headingLevel === 2 ? "h2" : "h3";
  const columns = module.columns ?? 2;
  const layout =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  return (
    <div>
      {module.title ? (
        <Tag
          className="mb-5 font-semibold text-xl tracking-tight"
          data-module-title
        >
          {module.title}
        </Tag>
      ) : null}
      <div className={cn("grid items-start gap-5", layout)} data-gallery>
        {module.images?.map((image) =>
          image.asset ? (
            <figure className="min-w-0" key={image._key}>
              <AspectRatio ratio={4 / 3}>
                <SanityImage
                  className="h-full w-full rounded-lg object-cover"
                  height={750}
                  image={image}
                  sizes="(min-width: 768px) 400px, 100vw"
                  width={1000}
                />
              </AspectRatio>
              {image.caption ? (
                <figcaption className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null
        )}
      </div>
    </div>
  );
}

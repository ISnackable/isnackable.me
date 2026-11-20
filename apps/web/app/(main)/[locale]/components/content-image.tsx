import {
  SanityImage,
  type SanityImageProps,
} from "@repo/cms/components/sanity-image";
import { ArrowUpRightIcon } from "lucide-react";

interface ContentImageProps {
  image?: SanityImageProps["image"] | null;
  sizes: string;
}

export function ContentImage({ image, sizes }: ContentImageProps) {
  return (
    <div className="content-image relative aspect-[16/10] overflow-hidden bg-muted">
      <div className="absolute inset-0 overflow-hidden">
        {image ? (
          <SanityImage
            className="content-image-picture object-cover"
            fill
            image={image}
            sizes={sizes}
          />
        ) : (
          <div aria-hidden="true" className="project-placeholder">
            <span>{"</>"}</span>
          </div>
        )}
      </div>
      <span aria-hidden="true" className="content-image-arrow">
        <ArrowUpRightIcon className="arrow-out size-5" />
        <ArrowUpRightIcon className="arrow-in size-5" />
      </span>
    </div>
  );
}

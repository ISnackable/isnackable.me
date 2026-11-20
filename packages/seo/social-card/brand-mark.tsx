import type { CSSProperties, ReactNode } from "react";

export interface BrandMarkProps {
  /** Placeholder tile background when `src` is empty. Accepts colors and gradients. */
  background?: string;
  /** Placeholder tile content when `src` is empty, such as a monogram or icon. */
  children?: ReactNode;
  fit?: "contain" | "cover";
  radius?: number | string;
  size?: number;
  /** Logo URL or data URI. Satori decodes PNG, JPEG, and GIF only. */
  src?: string;
  style?: CSSProperties;
}

export const BrandMark = ({
  src,
  size = 40,
  radius = 8,
  background,
  fit = "contain",
  children,
  style,
}: BrandMarkProps) =>
  src ? (
    // Satori can paint `alt` text onto the image, so it stays empty.
    // biome-ignore lint/performance/noImgElement: Satori renders this image directly.
    <img
      alt=""
      height={size}
      src={src}
      style={{ borderRadius: radius, flexShrink: 0, objectFit: fit, ...style }}
      width={size}
    />
  ) : (
    <div
      style={{
        alignItems: "center",
        // Satori throws on `undefined` style values.
        ...(background && { background }),
        borderRadius: radius,
        display: "flex",
        flexShrink: 0,
        height: size,
        justifyContent: "center",
        width: size,
        ...style,
      }}
    >
      {children}
    </div>
  );

/** Shared by the build capture and the visitor's worker. Bump for pose/style changes. */
export const LANYARD_PREVIEW_VERSION = 2;
export const LANYARD_HERO_FOV = 11;
export const LANYARD_ENTRANCE_RISE = 0.04;
export const LANYARD_ENTRANCE_TILT = (2 * Math.PI) / 180;
export const LANYARD_PREVIEW_SIZES = {
  desktop: { width: 360, height: 820, pixelRatio: 2 },
  mobile: { width: 345, height: 496.8, pixelRatio: 2 },
} as const;

export interface LanyardPreviewImages {
  entrance: { src: string; src2x: string };
  rest: { src: string; src2x: string };
}

export interface LanyardPreview {
  contentKey: string;
  desktop: { light: LanyardPreviewImages; dark: LanyardPreviewImages };
  mobile: { light: LanyardPreviewImages; dark: LanyardPreviewImages };
}

export interface LanyardPreviewManifest {
  previews: Record<string, LanyardPreview>;
  version: number;
}

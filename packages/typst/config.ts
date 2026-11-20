/**
 * Fonts, package dependencies, and CJK detection shared by the server-side
 * and client-side (Web Worker) compilation paths.
 */
export const CORE_FONTS = [
  "https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/IBMPlexSans-Regular.ttf",
  "https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/IBMPlexSans-Bold.ttf",
  "https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/NewCMMath-Regular.otf",
  "https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/NewCMMath-Book.otf",
  "https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@7.2.0/otfs/Font%20Awesome%207%20Brands-Regular-400.otf",
  "https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@7.2.0/otfs/Font%20Awesome%207%20Free-Regular-400.otf",
  "https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@7.2.0/otfs/Font%20Awesome%207%20Free-Solid-900.otf",
];

export const CJK_FONTS = [
  "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf",
  "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf",
];

const CJK_REGEX =
  /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]|[\u3040-\u309F\u30A0-\u30FF]|[\uAC00-\uD7AF]/;

export function needsCJKFont(text: string): boolean {
  return CJK_REGEX.test(text);
}

export interface PreviewPackageSpec {
  name: string;
  namespace: "preview";
  version: string;
}

const BRILLIANT_CV: PreviewPackageSpec = {
  namespace: "preview",
  name: "brilliant-cv",
  version: "4.1.1",
};

export const BRILLIANT_CV_IMPORT = `@${BRILLIANT_CV.namespace}/${BRILLIANT_CV.name}:${BRILLIANT_CV.version}`;

/**
 * Typst package dependency graph. Each key maps to its transitive
 * dependencies so the registry can prefetch them all up front.
 */
export const PACKAGE_DEPENDENCIES: Record<string, PreviewPackageSpec[]> = {
  [packageKey(BRILLIANT_CV)]: [
    { namespace: "preview", name: "fontawesome", version: "0.6.2" },
  ],
};

export function packageKey(spec: PreviewPackageSpec): string {
  return `${spec.namespace}/${spec.name}/${spec.version}`;
}

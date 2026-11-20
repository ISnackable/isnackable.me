import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  fonts: vi.fn(),
  create: vi.fn(),
  reset: vi.fn(),
  compile: vi.fn(),
}));

vi.mock("@myriaddreamin/typst.ts", () => ({
  MemoryAccessModel: class {},
  FetchPackageRegistry: class {},
  loadFonts: mocks.fonts,
  createTypstCompiler: () => {
    mocks.create();
    return {
      init: mocks.init,
      reset: mocks.reset,
      resetShadow: vi.fn(),
      addSource: vi.fn(),
      mapShadow: vi.fn(),
      compile: mocks.compile,
    };
  },
}));
vi.mock("@myriaddreamin/typst.ts/options.init", () => ({
  withAccessModel: vi.fn(),
  withPackageRegistry: vi.fn(),
}));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  mocks.init.mockResolvedValue(undefined);
  mocks.reset.mockResolvedValue(undefined);
  mocks.compile.mockResolvedValue({ result: new Uint8Array([80, 68, 70]) });
});

const project = (text: string) => ({
  assets: {},
  files: { "main.typ": text },
  mainFile: "main.typ",
  filename: "resume.pdf",
});

test.each(["Resume", "履歴書 简历"])(
  "PDF exports recover after compiler initialization fails for %s",
  async (text) => {
    const { compileTypstProject } = await import("@repo/typst/server");
    const { CORE_FONTS, CJK_FONTS, needsCJKFont } = await import(
      "@repo/typst/config"
    );
    mocks.init.mockRejectedValueOnce(new Error("Temporary font failure"));

    await expect(compileTypstProject(project(text))).rejects.toThrow(
      "Temporary font failure"
    );
    await expect(compileTypstProject(project(text))).resolves.toMatchObject({
      filename: "resume.pdf",
      pdfArtifactBase64: "UERG",
    });
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(mocks.fonts).toHaveBeenLastCalledWith(
      needsCJKFont(text) ? [...CORE_FONTS, ...CJK_FONTS] : CORE_FONTS,
      { assets: ["text"] }
    );

    await compileTypstProject(project(text));
    expect(mocks.create).toHaveBeenCalledTimes(2);
  }
);

test("a failed CJK compiler upgrade can retry without retaining a broken font state", async () => {
  const { compileTypstProject } = await import("@repo/typst/server");
  await compileTypstProject(project("Resume"));
  mocks.init.mockRejectedValueOnce(new Error("CJK font unavailable"));
  await expect(compileTypstProject(project("履歴書"))).rejects.toThrow(
    "CJK font unavailable"
  );
  await expect(compileTypstProject(project("简历"))).resolves.toBeDefined();
  expect(mocks.create).toHaveBeenCalledTimes(3);
});

import en from "@repo/internationalization/messages/en.json";
import { NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";
import { GET } from "../app/(main)/[locale]/resume/pdf/route";

const {
  draftMode,
  getResume,
  getPortfolioDictionary,
  compileTypstProject,
  generateTypstProject,
} = vi.hoisted(() => ({
  draftMode: vi.fn(),
  getResume: vi.fn(),
  getPortfolioDictionary: vi.fn(),
  compileTypstProject: vi.fn(),
  generateTypstProject: vi.fn(),
}));

vi.mock("next/headers", () => ({ draftMode }));
vi.mock("@repo/cms", () => ({ resume: { get: getResume } }));
vi.mock("@repo/internationalization/dictionaries", () => ({
  getPortfolioDictionary,
}));
vi.mock("@repo/typst/server", () => ({ compileTypstProject }));
vi.mock("../app/(main)/[locale]/resume/lib/generate-typst-project", () => ({
  generateTypstProject,
}));

beforeEach(() => {
  vi.clearAllMocks();
  getPortfolioDictionary.mockResolvedValue(en);
  getResume.mockResolvedValue({
    _id: "resume-en",
    firstName: "Test",
    lastName: "Author",
  });
  generateTypstProject.mockReturnValue({ filename: "resume.pdf" });
  compileTypstProject.mockResolvedValue({
    pdfArtifactBase64: Buffer.from("%PDF-test").toString("base64"),
  });
});

test("preview PDF exports inherit the selected perspective and cannot be publicly cached", async () => {
  draftMode.mockResolvedValue({ isEnabled: true });
  const response = await GET(
    new NextRequest("https://example.com/en/resume/pdf"),
    {
      params: Promise.resolve({ locale: "en" }),
    }
  );

  // Let the CMS resolver preserve release stacks and variants from cookies.
  // Forcing 'drafts' here would export different content from a release preview.
  expect(getResume).toHaveBeenCalledWith("en", { stega: false });
  expect(generateTypstProject).toHaveBeenCalledWith(
    expect.objectContaining({ firstName: "Test", lastName: "Author" }),
    "en",
    en.web.resume.placeholderName
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("Content-Type")).toBe("application/pdf");
});

test("published PDF exports retain their public cache policy", async () => {
  draftMode.mockResolvedValue({ isEnabled: false });
  const response = await GET(
    new NextRequest("https://example.com/en/resume/pdf"),
    {
      params: Promise.resolve({ locale: "en" }),
    }
  );

  expect(getResume).toHaveBeenCalledWith("en", { stega: false });
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe(
    "public, max-age=3600, s-maxage=86400"
  );
});

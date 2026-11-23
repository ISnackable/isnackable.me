import { resume } from "@repo/cms";
import { getPortfolioDictionary } from "@repo/internationalization/dictionaries";
import { log } from "@repo/observability/log";
import { compileTypstProject } from "@repo/typst/server";
import type { CompiledTypstDocument, TypstProject } from "@repo/typst/types";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { generateTypstProject } from "../lib/generate-typst-project";

interface ResumePdfRouteProps {
  readonly params: Promise<{
    locale: string;
  }>;
}

/**
 * On-demand server-side PDF compilation.
 *
 * The resume page renders with standard React for instant load. The Typst
 * PDF is only compiled when the user clicks "Download PDF", keeping the
 * heavy WASM compilation off the critical rendering path.
 */
export async function GET(
  _request: NextRequest,
  { params }: ResumePdfRouteProps
) {
  const { locale } = await params;
  const { isEnabled: isDraftMode } = await draftMode();

  const [profile, dictionary] = await Promise.all([
    resume.get(locale, { stega: false }),
    getPortfolioDictionary(locale),
  ]);

  if (!(profile?._id && profile.firstName && profile.lastName)) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  let project: TypstProject;
  try {
    project = generateTypstProject(
      profile,
      locale,
      dictionary.web.resume.placeholderName
    );
  } catch {
    return new NextResponse("Failed to generate resume document", {
      status: 500,
    });
  }

  let artifact: CompiledTypstDocument;
  try {
    artifact = await compileTypstProject(project);
  } catch (error) {
    log.error("Failed to compile résumé PDF", { error, locale });
    return new NextResponse("Failed to compile PDF", { status: 500 });
  }

  const pdfBytes = Buffer.from(artifact.pdfArtifactBase64, "base64");

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.filename}"`,
      "Cache-Control": isDraftMode
        ? "no-store"
        : "public, max-age=3600, s-maxage=86400",
    },
  });
}

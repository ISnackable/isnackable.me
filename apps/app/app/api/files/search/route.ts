import type { NextRequest } from "next/server";
import { FilesError } from "@/lib/files/errors";
import { jsonError, noStore } from "@/lib/files/http";
import { searchQueryLimit } from "@/lib/files/limits";
import { searchFiles } from "@/lib/files/search";
import type { SearchPage } from "@/lib/files/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const text = query.get("q")?.trim() ?? "";
  try {
    if (query.getAll("q").length > 1 || text.length > searchQueryLimit) {
      throw new FilesError("invalid");
    }
    const results = text
      ? await searchFiles(text, request.signal)
      : ({ entries: [], hasMore: false } satisfies SearchPage);
    return Response.json(results, { headers: noStore });
  } catch (error) {
    return jsonError(error);
  }
}

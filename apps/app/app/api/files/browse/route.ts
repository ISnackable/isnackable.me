import type { NextRequest } from "next/server";
import { browseFiles } from "@/lib/files/browse";
import { FilesError } from "@/lib/files/errors";
import { jsonError, noStore, pathFromQuery } from "@/lib/files/http";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  try {
    const path = pathFromQuery(query);
    if (query.getAll("cursor").length > 1) {
      throw new FilesError("invalid-cursor");
    }
    const page = await browseFiles(path, query.get("cursor"), request.signal);
    return Response.json(page, { headers: noStore });
  } catch (error) {
    return jsonError(error);
  }
}

import { serveThumbnailRequest } from "@/lib/files/content";

export function GET(request: Request) {
  return serveThumbnailRequest(request);
}

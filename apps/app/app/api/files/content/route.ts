import { publicContentHeaders, serveFileRequest } from "@/lib/files/content";

export const maxDuration = 300;

export function GET(request: Request) {
  return serveFileRequest(request);
}

export const HEAD = GET;

export function OPTIONS() {
  return new Response(null, {
    headers: {
      ...publicContentHeaders,
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Allow-Methods": "GET, HEAD",
      Allow: "GET, HEAD, OPTIONS",
    },
    status: 204,
  });
}

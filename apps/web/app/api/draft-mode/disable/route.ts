import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Disables Next.js Draft Mode and redirects back to the homepage.
 */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const url = new URL("/", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

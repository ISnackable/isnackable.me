import { env } from "@/env";

export const siteUrl = new URL(env.NEXT_PUBLIC_WEB_URL);

// Vercel serves public pages and share images over HTTPS.
if (
  siteUrl.protocol === "http:" &&
  (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production")
) {
  siteUrl.protocol = "https:";
}

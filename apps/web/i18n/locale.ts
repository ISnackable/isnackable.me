import { hasLocale, routing } from "@repo/internationalization";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { locale as getRootLocale } from "next/root-params";
import { connection } from "next/server";

/** Root locale is reusable in App Shells, unlike URL-specific page params. */
export async function getSiteLocale() {
  if ((await draftMode()).isEnabled) {
    await connection();
  }
  const locale = await getRootLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return locale;
}

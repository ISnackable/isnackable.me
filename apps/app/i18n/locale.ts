import { isLocale } from "@repo/internationalization/locales";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";

export async function getFilesLocale() {
  const value = await locale();
  if (!isLocale(value)) {
    notFound();
  }
  return value;
}

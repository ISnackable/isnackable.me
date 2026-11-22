import { redirect } from "next/navigation";
import { getFilesLocale } from "@/i18n/locale";
import { browseHref } from "@/lib/files/paths";

export default async function LocaleIndex() {
  redirect(browseHref(await getFilesLocale()));
}

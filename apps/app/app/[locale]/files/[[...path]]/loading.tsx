import { getFilesDictionary } from "@repo/internationalization/dictionaries";
import { FilesLoading } from "@/components/files/status";
import { getFilesLocale } from "@/i18n/locale";

export default async function Loading() {
  const { files } = await getFilesDictionary(await getFilesLocale());
  return <FilesLoading label={files.loading} />;
}

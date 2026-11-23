import { getFilesDictionary } from "@repo/internationalization/dictionaries";
import { BrowseView } from "@/components/files/browse-view";
import { FilesStatus } from "@/components/files/status";
import { getFilesLocale } from "@/i18n/locale";
import { browseHref, readBrowsePath } from "@/lib/files/paths";

export default async function BrowsePage({
  params,
}: {
  readonly params: Promise<{ path?: string[] }>;
}) {
  const [locale, { path: segments = [] }] = await Promise.all([
    getFilesLocale(),
    params,
  ]);
  const { files: messages } = await getFilesDictionary(locale);
  const path = readBrowsePath(segments);
  if (!path) {
    return (
      <FilesStatus
        description={messages.missingDescription}
        home={{ href: browseHref(locale), label: messages.home }}
        title={messages.missing}
      />
    );
  }
  return (
    <BrowseView
      key={path.join("/")}
      locale={locale}
      messages={messages}
      path={path}
    />
  );
}

import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { FileIcon, FolderIcon } from "lucide-react";
import type { SearchPage } from "@/lib/files/types";
import { BrowseLink } from "./browse-link";

export function SearchMatches({
  entries,
  hasMore,
  locale,
  messages,
  onNavigate,
}: SearchPage & {
  readonly locale: Locale;
  readonly messages: Pick<
    FilesMessages,
    "root" | "searchEmpty" | "searchRefine"
  >;
  readonly onNavigate?: () => void;
}) {
  return (
    <>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm" role="status">
          {messages.searchEmpty}
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {entries.map(({ kind, name, path }) => {
            const Icon = kind === "folder" ? FolderIcon : FileIcon;
            return (
              <li key={path.join("/")}>
                <BrowseLink
                  className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-accent focus-visible:outline-offset-[-2px]"
                  locale={locale}
                  onNavigate={onNavigate}
                  path={path}
                >
                  <Icon
                    aria-hidden
                    className="size-5 shrink-0 text-muted-foreground"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="wrap-break-word font-medium text-sm">
                      {name}
                    </span>
                    <span className="wrap-break-word text-muted-foreground text-xs">
                      {path.slice(0, -1).join(" / ") || messages.root}
                    </span>
                  </span>
                </BrowseLink>
              </li>
            );
          })}
        </ul>
      )}
      {hasMore && (
        <p className="text-muted-foreground text-sm">{messages.searchRefine}</p>
      )}
    </>
  );
}

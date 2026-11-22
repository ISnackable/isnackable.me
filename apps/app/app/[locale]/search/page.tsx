import {
  type FilesMessages,
  getFilesDictionary,
} from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { connection } from "next/server";
import { Suspense } from "react";
import { SearchMatches } from "@/components/files/search-matches";
import { FilesLoading } from "@/components/files/status";
import { getFilesLocale } from "@/i18n/locale";
import { searchQueryLimit } from "@/lib/files/limits";
import { searchFiles } from "@/lib/files/search";

type SearchParams = Promise<{ q?: string | string[] }>;

async function SearchResults({
  locale,
  messages,
  query,
}: {
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly query: SearchParams;
}) {
  const { q } = await query;
  const text = typeof q === "string" ? q.trim() : "";
  if (!text || text.length > searchQueryLimit) {
    return (
      <p className="text-muted-foreground text-sm">
        {text ? messages.searchTooLong : messages.searchPrompt}
      </p>
    );
  }
  await connection();
  try {
    const matches = await searchFiles(text);
    return (
      <>
        <p className="break-all text-muted-foreground text-sm">{text}</p>
        <SearchMatches {...matches} locale={locale} messages={messages} />
      </>
    );
  } catch {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        {messages.searchUnavailable}
      </p>
    );
  }
}

export default async function SearchPage({
  searchParams,
}: {
  readonly searchParams: SearchParams;
}) {
  const locale = await getFilesLocale();
  const { files: messages } = await getFilesDictionary(locale);
  return (
    <>
      <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
        {messages.searchHeading}
      </h1>
      <Suspense fallback={<FilesLoading label={messages.loading} />}>
        <SearchResults
          locale={locale}
          messages={messages}
          query={searchParams}
        />
      </Suspense>
    </>
  );
}

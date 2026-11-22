"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/design-system/components/ui/input-group";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { SearchIcon, XIcon } from "lucide-react";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { fetchFilesJson } from "@/lib/files/client";
import { searchQueryLimit } from "@/lib/files/limits";
import type { SearchPage } from "@/lib/files/types";
import { SearchMatches } from "./search-matches";

export function FilesSearchDialog({
  locale,
  messages,
}: {
  readonly locale: Locale;
  readonly messages: FilesMessages;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const text = query.trim();
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 350);
    return () => clearTimeout(timer);
  }, [text]);

  const key =
    open && text && text === debounced
      ? `/api/files/search?${new URLSearchParams({ q: text })}`
      : null;
  const { data, error } = useSWR(key, fetchFilesJson<SearchPage>, {
    revalidateOnFocus: false,
  });

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
    }
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogTrigger
        aria-label={messages.search}
        render={
          <Button
            className="w-full justify-start md:max-w-xs"
            variant="outline"
          />
        }
      >
        <SearchIcon aria-hidden data-icon="inline-start" />
        {messages.searchPlaceholder}
      </DialogTrigger>
      <DialogContent initialFocus={input} showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>{messages.search}</DialogTitle>
          <DialogDescription className="sr-only">
            {messages.searchPrompt}
          </DialogDescription>
          <DialogClose
            aria-label={messages.closeSearch}
            render={<Button size="icon-sm" variant="ghost" />}
          >
            <XIcon aria-hidden />
          </DialogClose>
        </DialogHeader>
        <Form action={`/${locale}/search`} onSubmit={() => changeOpen(false)}>
          <InputGroup>
            <InputGroupInput
              aria-label={messages.search}
              className="text-base md:text-sm"
              enterKeyHint="search"
              maxLength={searchQueryLimit}
              name="q"
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={messages.searchPlaceholder}
              ref={input}
              type="search"
              value={query}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={messages.searchHeading}
                size="icon-xs"
                type="submit"
              >
                <SearchIcon aria-hidden />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Form>
        {text && (
          <div className="flex max-h-[min(50svh,24rem)] flex-col gap-3 overflow-y-auto">
            {data ? (
              <SearchMatches
                {...data}
                locale={locale}
                messages={messages}
                onNavigate={() => changeOpen(false)}
              />
            ) : (
              <p className="text-muted-foreground text-sm" role="status">
                {error ? messages.searchUnavailable : messages.loading}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

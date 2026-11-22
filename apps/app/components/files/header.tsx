import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { ArrowUpRightIcon, CloudIcon } from "lucide-react";
import { BrowseLink } from "./browse-link";
import { FilesLanguageSwitcher, ThemeToggle } from "./preferences";
import { FilesSearchDialog } from "./search-dialog";

export function FilesHeader({
  locale,
  messages,
  portfolioUrl,
  switchLanguageLabel,
}: {
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly portfolioUrl: string;
  readonly switchLanguageLabel: string;
}) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <BrowseLink
            className="flex w-fit items-center gap-2.5 rounded-md font-semibold text-sm tracking-tight"
            locale={locale}
            path={[]}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <CloudIcon aria-hidden className="size-4" />
            </span>
            {messages.title}
          </BrowseLink>
          <div className="flex shrink-0 items-center gap-0.5">
            <FilesLanguageSwitcher
              label={switchLanguageLabel}
              locale={locale}
            />
            <ThemeToggle label={messages.theme} />
            <a
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href={portfolioUrl}
            >
              <span className="hidden lg:inline">{messages.portfolio}</span>
              <ArrowUpRightIcon aria-hidden data-icon="inline-end" />
              <span className="sr-only lg:hidden">{messages.portfolio}</span>
            </a>
          </div>
        </div>
        <FilesSearchDialog locale={locale} messages={messages} />
      </div>
    </header>
  );
}

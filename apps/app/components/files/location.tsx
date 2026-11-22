import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/design-system/components/ui/breadcrumb";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { HouseIcon } from "lucide-react";
import { Fragment } from "react";
import { browseHref } from "@/lib/files/paths";
import { BrowseLink } from "./browse-link";

export function FileLocation({
  locale,
  messages,
  path,
}: {
  readonly locale: Locale;
  readonly messages: Pick<FilesMessages, "breadcrumb" | "root">;
  readonly path: readonly string[];
}) {
  const homeIcon = <HouseIcon aria-hidden className="size-4" />;

  return (
    <Breadcrumb aria-label={messages.breadcrumb}>
      <BreadcrumbList>
        <BreadcrumbItem className="size-8 shrink-0">
          {path.length === 0 ? (
            <h1
              aria-current="page"
              aria-label={messages.root}
              className="grid size-full place-items-center font-normal text-foreground"
            >
              {homeIcon}
            </h1>
          ) : (
            <BreadcrumbLink
              aria-label={messages.root}
              className={buttonVariants({
                className: "text-foreground",
                size: "icon-sm",
                variant: "ghost",
              })}
              render={<BrowseLink locale={locale} path={[]} />}
            >
              {homeIcon}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {path.map((name, index) => {
          const segment = path.slice(0, index + 1);
          return (
            <Fragment key={browseHref(locale, segment)}>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="min-w-0 max-w-full wrap-anywhere">
                {index === path.length - 1 ? (
                  <h1
                    aria-current="page"
                    className="font-normal text-foreground"
                  >
                    {name}
                  </h1>
                ) : (
                  <BreadcrumbLink
                    render={<BrowseLink locale={locale} path={segment} />}
                  >
                    {name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

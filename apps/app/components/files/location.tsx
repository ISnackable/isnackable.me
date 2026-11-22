import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/design-system/components/ui/breadcrumb";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
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
  return (
    <Breadcrumb aria-label={messages.breadcrumb}>
      <BreadcrumbList className="break-all">
        {[messages.root, ...path].map((name, index) => {
          const parent = path.slice(0, index);
          const href = browseHref(locale, parent);
          return (
            <Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === path.length ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<BrowseLink locale={locale} path={parent} />}
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

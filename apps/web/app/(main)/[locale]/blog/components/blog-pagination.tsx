import type { BlogFilters } from "@repo/cms/data/blog";
import {
  Button,
  buttonVariants,
} from "@repo/design-system/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@repo/design-system/components/ui/pagination";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary } from "@repo/internationalization";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { blogHref } from "@/lib/blog-discovery";

export function BlogPagination({
  copy,
  filters,
  locale,
  pageCount,
}: {
  copy: Dictionary["web"]["blog"]["discovery"];
  filters: BlogFilters;
  locale: string;
  pageCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }
  return (
    <Pagination aria-label={copy.pagination}>
      <PaginationContent className="w-full flex-wrap justify-between gap-2">
        <PaginationItem>
          {filters.page > 1 ? (
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "min-h-11")}
              href={blogHref(locale, {
                ...filters,
                page: filters.page - 1,
              })}
              rel="prev"
            >
              <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
              {copy.previous}
            </Link>
          ) : (
            <Button className="min-h-11" disabled variant="ghost">
              <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
              {copy.previous}
            </Button>
          )}
        </PaginationItem>
        <PaginationItem>
          <span
            aria-current="page"
            className="text-muted-foreground text-sm tabular-nums"
          >
            {copy.page
              .replace("{page}", String(filters.page))
              .replace("{pages}", String(pageCount))}
          </span>
        </PaginationItem>
        <PaginationItem>
          {filters.page < pageCount ? (
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "min-h-11")}
              href={blogHref(locale, {
                ...filters,
                page: filters.page + 1,
              })}
              rel="next"
            >
              {copy.next}
              <ChevronRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          ) : (
            <Button className="min-h-11" disabled variant="ghost">
              {copy.next}
              <ChevronRightIcon aria-hidden="true" data-icon="inline-end" />
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
